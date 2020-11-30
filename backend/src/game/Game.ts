import Player from './Player';
import User from '../model/User';
import Deck from './Deck';
import { DeckType } from '../model/DeckType';
import { triangularNumber } from '../utils/utils';
import Room from '../model/Room';
import { GameAction } from '../model/IGameEvent';
import IGameUpdateEvent, { GameUpdateAction } from '../model/IGameUpdateEvent';
import { PlayingCard, CardColor } from '../model/PlayingCard';

enum GameState {
  deal = 1,
  pyramid,
  standoff,
  busfahrer,
}

enum PredictionRound {
  redBlack = 0,
  lowerHigher,
  inOut,
  symbolEqual,
  numberEqual,
}

/**
 * Busfahrer
 */
class Game {
  private io: SocketIO.Server;
  private room: Room;
  private gameState: GameState;
  private gameCards: number;
  private pyramidRows: number;
  private pyramidCards: number;
  private players: Player[];
  private turn: number;
  private deck: Deck;
  private busfahrer?: Player;
  private lastCard?: PlayingCard;

  constructor(io: SocketIO.Server, room: Room, users: User[], gameCards: number, pyramidRows: number, deckType: DeckType) {
    this.io = io;
    this.room = room;
    this.gameState = GameState.deal;
    this.gameCards = gameCards;
    this.pyramidRows = pyramidRows;
    this.pyramidCards = triangularNumber(pyramidRows);
    this.players = users.map((user) => new Player(user));
    this.turn = -1;
    this.deck = new Deck(deckType);
  }

  public start(): void {
    if (this.turn === -1) {
      this.io.to(this.room.getId()).emit('gameEvent', {
        action: GameAction.StartGame,
        value: 0,
      });
      this.nextTurn();
    } else console.error('Game already running!');
  }

  public gameUpdateEvent(socket: SocketIO.Socket, e: IGameUpdateEvent): void {
    switch (e.action) {
      case GameUpdateAction.Predict: {
        if (this.gameState === GameState.deal) {
          const player = this.players[this.turn % this.players.length];

          // wrong player
          if (socket.id !== player.getUser().getId()) return;

          if (this.gameState !== GameState.deal) {
            console.log('Wrong gameState');
            return;
          }

          const card = this.deck.drawCard();
          const round = Math.floor(this.turn / this.players.length);

          this.io.to(this.room.getId()).emit('gameEvent', {
            action: GameAction.SayEvent,
            value: { name: player.getUser().getName(), round: round, choice: e.value },
          });
          if (!this.predictCard(player, round, card, e.value)) {
            this.io.to(this.room.getId()).emit('gameEvent', {
              action: GameAction.DrinkEvent,
              value: { name: player.getUser().getName(), shots: 1 },
            });
          }
          player.addCard(card);
          socket.emit('gameEvent', {
            action: GameAction.GiveCard,
            value: player.getHand(),
          });
        } else if (GameState.busfahrer) {
          if (!this.busfahrer) {
            console.log('wtf');
            return;
          }

          if (socket.id !== this.busfahrer.getUser().getId()) return;

          const card = this.deck.drawCard();
          this.io.to(this.room.getId()).emit('gameEvent', {
            action: GameAction.SayEvent,
            value: { name: this.busfahrer.getUser().getName(), round: this.turn, choice: e.value },
          });

          const pred = !this.predictCard(this.busfahrer, this.turn, card, e.value);
          
          this.busfahrer.addCard(card);
          this.io.to(this.room.getId()).emit('gameEvent', {
            action: GameAction.BusfahrerCard,
            value: this.busfahrer.getHand(),
          });
          if (pred) {
            this.io.to(this.room.getId()).emit('gameEvent', {
              action: GameAction.DrinkEvent,
              value: { name: this.busfahrer.getUser().getName(), shots: this.turn + 1 },
            });

            this.turn = -1;
            this.busfahrer.resetHand();
          }
        }
        break;
      }
      case GameUpdateAction.Uncover: {
        if (this.gameState !== GameState.pyramid) {
          console.log('Gamestate not pyramid');
          return;
        }

        if (socket.id !== this.room.getAdminId()) return;

        const card = this.deck.drawCard();
        this.lastCard = card;
        this.io.to(this.room.getId()).emit('gameEvent', {
          action: GameAction.UncoverCard,
          value: card,
        });
        break;
      }
      case GameUpdateAction.PlayCard: {
        const player = this.players.find(player => player.getUser().getId() === socket.id);
        if (!player || !this.lastCard) return;
        if (player.removeCard(this.lastCard)) {
          this.io.to(this.room.getId()).emit('gameEvent', {
            action: GameAction.GiveEvent,
            value: { name: player.getUser().getName(), receiver: 'irgendjemand', shots: this.numToRow(this.turn - 1) },
          });
        }
        socket.emit('gameEvent', {
          action: GameAction.GiveCard,
          value: player.getHand(),
        });

        return;
      }
    }

    this.nextTurn();
  }

  private numToRow(n: number): number {
    if (n < 1) return 1;
    if (n < 3) return 2;
    if (n < 6) return 3;
    if (n < 10) return 4;
    if (n < 15) return 5;
    return 0;
  }

  private nextTurn(): void {
    this.turn++;
    if (this.gameState === GameState.deal && Math.floor(this.turn / this.players.length) === this.gameCards) {
      // pyramid init
      this.turn = 0;
      this.gameState = GameState.pyramid;
      this.io.to(this.room.getId()).emit('gameEvent', {
        action: GameAction.StateChange,
        value: GameState.pyramid,
      });
      this.io.to(this.room.getAdminId()).emit('gameEvent', {
        action: GameAction.AskCard,
        value: 1337,
      });
    } else if (this.gameState === GameState.pyramid && this.turn - 1 === this.pyramidCards) {
      // busfahrer init
      this.turn = 0;
      this.deck = new Deck(DeckType.large);
      this.gameState = GameState.busfahrer;
      this.busfahrer = this.players.reduce((prev, curr) => (prev.getHand().length < curr.getHand().length ? curr : prev));
      this.busfahrer.resetHand();
      this.io.to(this.room.getId()).emit('gameEvent', {
        action: GameAction.StateChange,
        value: GameState.busfahrer,
      });
    } else if (this.gameState === GameState.busfahrer && (this.turn === 5 || this.deck.isEmpty())) {
      // finish
      this.io.to(this.room.getId()).emit('lobbyEvent', {
        id: this.room.getId(),
      });
    }

    switch (this.gameState) {
      case GameState.deal:
        this.askCard();
        break;
      case GameState.pyramid:
        this.pyramidTurn();
        break;
      case GameState.busfahrer:
        this.busfahrerTurn();
        break;
    }
  }

  private predictCard(player: Player, round: number, card: PlayingCard, prediction: number): boolean {
    switch (round) {
      case PredictionRound.redBlack: {
        const red = prediction === 0 && (card.color === CardColor.Heart || card.color === CardColor.Diamond);
        const black = prediction === 1 && (card.color === CardColor.Club || card.color === CardColor.Spade);
        return red || black;
      }
      case PredictionRound.lowerHigher: {
        const val = player.cardValue();
        return (prediction === 1 && card.number < val) || (prediction === 0 && val < card.number);
      }
      case PredictionRound.inOut: {
        const [min, max] = player.cardRange();
        const inside = prediction === 0 && min <= card.number && card.number <= max;
        const outside = prediction === 1 && (card.number < min || max < card.number);
        return inside || outside;
      }
      case PredictionRound.symbolEqual: {
        const inHand = player.cardSymbols();
        return (prediction === 0 && inHand.indexOf(card.color) !== -1) || (prediction === 1 && inHand.indexOf(card.color) === -1);
      }
      case PredictionRound.numberEqual: {
        const inHand = player.cardNumbers();
        return (prediction === 0 && inHand.indexOf(card.number) !== -1) || (prediction === 1 && inHand.indexOf(card.number) === -1);
      }
    }
    console.error('Unknown PredictionRound');
    return false;
  }

  private askCard(): void {
    const player = this.players[this.turn % this.players.length];
    this.io
      .to(player.getUser().getId())
      .emit('gameEvent', { action: GameAction.AskCard, value: Math.floor(this.turn / this.players.length) });
  }

  private pyramidTurn(): void {
    this.io.to(this.room.getAdminId()).emit('gameEvent', {
      action: GameAction.AskCard,
      value: 1337,
    });
  }

  private busfahrerTurn(): void {
    if (!this.busfahrer) {
      console.log('No Busfahrer, but driving');
      return;
    }
    this.io.to(this.busfahrer.getUser().getId()).emit('gameEvent', {
      action: GameAction.AskCard,
      value: this.turn,
    });
  }
}

export default Game;
