import React, { Component } from 'react';
import Container from '../components/Container';
import SplitLayout from '../components/SplitLayout';
import Card from '../components/Card';
import Player from '../components/Player';
import { RoomSettings, RoomPlayer } from '../model/RoomTypes';
import { GameUpdateAction } from '../model/IGameUpdateEvent';

type RoomProps = {
  socket: SocketIOClient.Socket;
  settings: RoomSettings;
  maxPlayers: number;
  players: RoomPlayer[];
  admin: string;
};

enum Deck {
  small = 0,
  large,
}

class Room extends Component<RoomProps, RoomSettings> {
  constructor(props: RoomProps) {
    super(props);

    this.state = {
      gameDeck: Deck.small,
      pyramidDouble: false,
      pyramidTriple: false,
      busfahrerDeck: Deck.large,
    };

    this.copy = this.copy.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onAdminClick = this.onAdminClick.bind(this);
    this.onXClick = this.onXClick.bind(this);
  }

  componentDidMount(): void {
    if (JSON.stringify(this.props.settings) !== JSON.stringify(this.state)) this.setState(this.props.settings);
  }

  componentDidUpdate(prevProps: RoomProps): void {
    if (JSON.stringify(this.props.settings) !== JSON.stringify(prevProps.settings)) {
      console.log('new props');
      this.componentDidMount();
    }
  }

  /**
   * Starts the game
   * @param e click event
   */
  onClick(): void {
    this.props.socket.emit('gameUpdateEvent', {
      action: GameUpdateAction.Start,
      value: 0,
    });
    return;
  }

  /**
   * Copys the game link into clipboard
   * @param e click event
   */
  copy(e: React.FormEvent<HTMLInputElement>): void {
    const el = e.currentTarget as HTMLInputElement;
    el.select();
    el.setSelectionRange(0, 1000);
    document.execCommand('copy');
  }

  /**
   * Updates the state of the form
   * @param e input event
   */
  onChange(e: React.FormEvent<HTMLInputElement>): void {
    const el = e.currentTarget as HTMLInputElement;

    if (el.type === 'checkbox')
      this.setState(({ [el.name]: el.checked } as unknown) as Pick<RoomSettings, keyof RoomSettings>, () => this.emitChange());
    else this.setState(({ [el.name]: Number(el.value) } as unknown) as Pick<RoomSettings, keyof RoomSettings>, () => this.emitChange());
  }

  emitChange(): void {
    this.props.socket.emit('lobbyUpdateEvent', {
      action: 3,
      value: this.state,
    });
  }

  /**
   * Updates the admin
   * @param id
   */
  onAdminClick(id: string): void {
    console.log('makead');
    this.props.socket.emit('lobbyUpdateEvent', {
      action: 1,
      value: id,
    });
  }

  /**
   * Kicks a player
   * @param id
   */
  onXClick(id: string): void {
    this.props.socket.emit('lobbyUpdateEvent', {
      action: 2,
      value: id,
    });
  }

  render(): JSX.Element {
    const showAdmin = this.props.socket.id === this.props.admin;

    return (
      <Container>
        <SplitLayout>
          <Card>
            <header>
              <h1>Optionen</h1>
            </header>
            <fieldset disabled={this.props.socket.id !== this.props.admin}>
              <section>
                <h3>Spiel</h3>
                <label className="d-inline-flex">
                  <input
                    type="radio"
                    name="gameDeck"
                    value={Deck.small}
                    checked={this.state.gameDeck === Deck.small}
                    onChange={this.onChange}
                  />
                  <span className="checkable">kleines Deck</span>
                </label>
                <label className="d-inline-flex">
                  <input
                    type="radio"
                    name="gameDeck"
                    value={Deck.large}
                    checked={this.state.gameDeck === Deck.large}
                    onChange={this.onChange}
                  />
                  <span className="checkable">großes Deck</span>
                </label>
              </section>
              <section>
                <h3>Pyramide</h3>
                <label className="d-flex">
                  <input type="checkbox" name="pyramidDouble" checked={this.state.pyramidDouble} onChange={this.onChange} />
                  <span className="checkable">linke Karten doppelt</span>
                </label>
                <label className="d-flex">
                  <input type="checkbox" name="pyramidTriple" checked={this.state.pyramidTriple} onChange={this.onChange} />
                  <span className="checkable">mittlere Karten dreifach</span>
                </label>
              </section>
              <section>
                <h3>Busfahrer</h3>
                <div>
                  <label className="d-inline-flex">
                    <input
                      type="radio"
                      name="busfahrerDeck"
                      value={Deck.small}
                      checked={this.state.busfahrerDeck === Deck.small}
                      onChange={this.onChange}
                    />
                    <span className="checkable">kleines Deck</span>
                  </label>
                  <label className="d-inline-flex">
                    <input
                      type="radio"
                      name="busfahrerDeck"
                      value={Deck.large}
                      checked={this.state.busfahrerDeck === Deck.large}
                      onChange={this.onChange}
                    />
                    <span className="checkable">großes Deck</span>
                  </label>
                </div>
              </section>
            </fieldset>
            {showAdmin && (
              <footer>
                <button onClick={this.onClick} className="right success">
                  Spiel starten
                </button>
              </footer>
            )}
          </Card>
          <Card>
            <header>
              <h1>
                <small>
                  {this.props.players.length}/{this.props.maxPlayers}
                </small>{' '}
                Mitspieler
              </h1>
            </header>
            <section>
              {this.props.players.map((player) => (
                <Player
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  imgUrl="./person.svg"
                  showAdmin={showAdmin}
                  isAdmin={player.id === this.props.admin}
                  isSelf={this.props.socket.id === player.id}
                  onAdminClick={this.onAdminClick}
                  onXClick={this.onXClick}
                />
              ))}
            </section>
            <hr />
            <footer className="small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Einladungslink: <input className="share-link" onClick={(e) => this.copy(e)} readOnly defaultValue={window.location.href} />
            </footer>
          </Card>
        </SplitLayout>
      </Container>
    );
  }
}

export default Room;
