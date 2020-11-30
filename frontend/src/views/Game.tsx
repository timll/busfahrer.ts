import React, { Component, createRef } from 'react';
import Card from '../components/Card';
import { SayEvent, GiveEvent, DrinkEvent } from '../components/GameEvent';
import Pyramid from '../components/Pyramid';
import GameHand, { QuestionType } from '../components/GameHand';
import { GameState } from '../model/GameState';
import Busfahrer from '../components/Busfahrer';
import { PlayingCard } from '../components/GameCard';
import IGameEvent, { GameAction } from '../model/IGameEvent';

type State = {};

type Props = {
  events: IGameEvent[];
  socket: SocketIOClient.Socket;
  gameState: GameState;
  handCards: PlayingCard[];
  question?: QuestionType;
  pyramidCards: PlayingCard[];
  busfahrerCards: PlayingCard[];
  resetQuestion: Function;
};

class Game extends Component<Props, State> {
  private eventList: React.RefObject<HTMLElement>;

  constructor(props: Props) {
    super(props);

    this.state = {
      gameState: GameState.pyramid,
    };

    this.eventList = createRef();
  }

  componentDidUpdate(): void {
    if (this.eventList.current) {
      const el = this.eventList.current;
      el.scrollTop = el.scrollHeight;
    }
  }

  sharedHand(): JSX.Element {
    switch (this.props.gameState) {
      case GameState.pyramid:
        return <Pyramid rows={5} cards={this.props.pyramidCards} />;
      case GameState.busfahrer:
        return <Busfahrer cards={this.props.busfahrerCards} />;
      default:
        return <div></div>;
    }
  }

  render(): JSX.Element {
    return (
      <div className="game">
        <div className="table">
          <Card>
            <header>
              <h1>Tisch</h1>
            </header>
            <section>
              <div className="split">
                <div className="sharedHand">{this.sharedHand()}</div>
                <div className="enemyHand">{/* TODO: show enemies */}</div>
              </div>
              <GameHand
                socket={this.props.socket}
                cards={this.props.handCards}
                question={this.props.question}
                resetQuestion={this.props.resetQuestion}
                clickable={this.props.pyramidCards[this.props.pyramidCards.length - 1]}
              />
            </section>
          </Card>
        </div>
        <div className="events">
          <Card>
            <header>
              <h1>Ereignisse</h1>
            </header>
            <section ref={this.eventList}>
              <small>
                {this.props.events.map((e) => {
                  switch (e.action) {
                    case GameAction.SayEvent:
                      return <SayEvent name={e.value.name} round={e.value.round} choice={e.value.choice} />;
                    case GameAction.DrinkEvent:
                      return <DrinkEvent name={e.value.name} shots={e.value.shots} />;
                    case GameAction.GiveEvent:
                      return <GiveEvent name={e.value.name} receiver={e.value.receiver} shots={e.value.shots} />;
                  }
                  return '';
                })}
              </small>
            </section>
          </Card>
        </div>
      </div>
    );
  }
}

export default Game;
