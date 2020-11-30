/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import io from 'socket.io-client';
import 'picnic';
import './App.scss';
import NamePicker from './views/NamePicker';
import Room from './views/Room';
import ILobbyEvent from './model/ILobbyEvent';
import Game from './views/Game';
import IErrorEvent, { errorMessage } from './model/IErrorEvent';
import Container from './components/Container';
import { RoomSettings, RoomPlayer } from './model/RoomTypes';
import IGameEvent, { GameAction } from './model/IGameEvent';
import { GameState } from './model/GameState';
import { PlayingCard } from './components/GameCard';
import { QuestionType } from './components/GameHand';

type State = {
  view: View;
  roomSettings: RoomSettings;
  roomMaxPlayers: number;
  roomPlayers: RoomPlayer[];
  roomAdmin: string;
  error: string;
  events: IGameEvent[];
  gameState: GameState;
  handCards: PlayingCard[];
  question?: QuestionType;
  pyramidCards: PlayingCard[];
  busfahrerCards: PlayingCard[];
};

enum View {
  NamePicker = 1,
  Room,
  Game,
}

const socket = io('http://178.202.99.12:3013');

class App extends Component<Record<string, any>, State> {
  constructor(props: Record<string, any>) {
    super(props);

    this.state = {
      view: View.NamePicker,
      roomSettings: {
        gameDeck: 1,
        busfahrerDeck: 1,
        pyramidDouble: false,
        pyramidTriple: false,
      },
      roomMaxPlayers: 8,
      roomPlayers: [],
      roomAdmin: '',
      error: '',
      events: [],
      gameState: GameState.deal,
      handCards: [],
      question: undefined,
      pyramidCards: [],
      busfahrerCards: [],
    };
  }

  componentDidMount(): void {
    socket.on('errorEvent', (e: IErrorEvent) => {
      if (e.code !== 'duplicate') window.history.pushState('', 'Busfahrer', '/');

      this.setState({
        view: View.NamePicker,
        error: errorMessage[e.code],
      });
    });
    socket.on('lobbyEvent', (e: ILobbyEvent) => {
      window.history.pushState('', 'Busfahrer', `/${e.id}`);
      this.setState((prev) => ({
        view: View.Room,
        roomSettings: e.settings ? e.settings : prev.roomSettings,
        roomPlayers: e.players ? e.players : prev.roomPlayers,
        roomMaxPlayers: e.maxPlayers ? e.maxPlayers : prev.roomMaxPlayers,
        roomAdmin: e.admin ? e.admin : prev.roomAdmin,
      }));
    });
    socket.on('gameEvent', (e: IGameEvent) => {
      switch (e.action) {
        case GameAction.StartGame:
          this.setState({
            view: View.Game,
            events: [],
            gameState: GameState.deal,
            handCards: [],
            question: undefined,
            pyramidCards: [],
            busfahrerCards: [],
          });
          break;
        case GameAction.StateChange:
          this.setState({ gameState: e.value });
          break;
        case GameAction.AskCard:
          this.setState({ question: e.value });
          break;
        case GameAction.GiveCard:
          this.setState({ handCards: e.value });
          break;
        case GameAction.UncoverCard:
          this.setState((prev) => ({ pyramidCards: [...prev.pyramidCards, e.value] }));
          break;
        case GameAction.BusfahrerCard:
          this.setState({
            busfahrerCards: e.value,
          });
          break;
        case GameAction.SayEvent:
        case GameAction.DrinkEvent:
        case GameAction.GiveEvent:
          this.setState((prev) => ({ events: [...prev.events, e] }));
          break;
      }
    });
  }

  resetQuestion(): void {
    this.setState({ question: undefined });
  }

  render(): JSX.Element {
    if (socket) {
      if (this.state.view === View.NamePicker) {
        return <NamePicker socket={socket} error={this.state.error} />;
      } else if (this.state.view === View.Room) {
        return (
          <Room
            socket={socket}
            settings={this.state.roomSettings}
            maxPlayers={this.state.roomMaxPlayers}
            admin={this.state.roomAdmin}
            players={this.state.roomPlayers}
          />
        );
      } else if (this.state.view === View.Game) {
        return (
          <Game
            socket={socket}
            events={this.state.events}
            gameState={this.state.gameState}
            handCards={this.state.handCards}
            question={this.state.question}
            resetQuestion={this.resetQuestion.bind(this)}
            pyramidCards={this.state.pyramidCards}
            busfahrerCards={this.state.busfahrerCards}
          />
        );
      } else {
        return <div>Oops. Something went wrong!</div>;
      }
    } else {
      return (
        <Container>
          <h1>Connecting...</h1>
        </Container>
      );
    }
  }
}

export default App;
