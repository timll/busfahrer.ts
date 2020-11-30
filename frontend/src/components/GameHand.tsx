import React, { Component } from 'react';
import GameCard, { PlayingCard } from './GameCard';
import { GameUpdateAction } from '../model/IGameUpdateEvent';

export enum QuestionType {
  redBlack = 0,
  lowerHigher,
  inOut,
  symbolEqual,
  numberEqual,
  uncoverCard = 1337,
}

type Props = {
  cards: PlayingCard[];
  question?: QuestionType;
  socket: SocketIOClient.Socket;
  clickable?: PlayingCard;
  resetQuestion: Function;
};

type State = {
  sent: boolean;
};

/**
 * Represents the own hand of a player
 */
class GameHand extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sent: false,
    };
  }

  /**
   * Sends the selected answer to the server
   * @param index answer index
   */
  send(index: number): void {
    if (this.props.question === QuestionType.uncoverCard) {
      this.props.socket.emit('gameUpdateEvent', {
        action: GameUpdateAction.Uncover,
        value: 1337,
      });
    } else {
      this.props.socket.emit('gameUpdateEvent', {
        action: GameUpdateAction.Predict,
        value: index,
      });
    }
    this.props.resetQuestion();
  }

  playCard(): void {
    this.props.socket.emit('gameUpdateEvent', {
      action: GameUpdateAction.PlayCard,
    });
  }

  render(): JSX.Element {
    let questions: string[] = [];

    switch (this.props.question) {
      case QuestionType.redBlack:
        questions = ['Rot', 'Schwarz'];
        break;
      case QuestionType.lowerHigher:
        questions = ['Höher', 'Tiefer'];
        break;
      case QuestionType.inOut:
        questions = ['Innerhalb', 'Außerhalb'];
        break;
      case QuestionType.symbolEqual:
        questions = ['Symbol gleich', 'Symbol anders'];
        break;
      case QuestionType.numberEqual:
        questions = ['Zahl gleich', 'Zahl anders'];
        break;
      case QuestionType.uncoverCard:
        questions = ['Aufdecken'];
        break;
    }

    return (
      <div className="hand">
        <div className="flex-row flex-grow d-flex justify-content-center align-center">
          {this.props.cards.map((card, i) => {
            const playable = this.props.clickable && card.number === this.props.clickable.number;
            return <GameCard key={i} card={card} playable={playable} onClick={playable ? this.playCard.bind(this) : () => {}}/>;
          })}
        </div>
        <div className="flex-column d-flex full-height">
          {!this.state.sent &&
            questions.map((q, i) => (
              <button key={q} onClick={() => this.send(i)}>
                {q}
              </button>
            ))}
        </div>
      </div>
    );
  }
}

export default GameHand;
