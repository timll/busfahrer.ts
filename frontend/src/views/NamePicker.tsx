import React, { Component } from 'react';
import Container from '../components/Container';
import SplitLayout from '../components/SplitLayout';
import Card from '../components/Card';

type Props = {
  socket: SocketIOClient.Socket;
  error: string;
};

type State = {
  input: string;
};

class NamePicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      input: '',
    };

    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  /**
   * Join the lobby
   * @param e click event
   */
  onClick(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();

    this.props.socket.emit('join', { name: this.state.input, room: window.location.pathname.substr(1) });
  }

  /**
   * Updates the name state
   * @param e input event
   */
  onChange(e: React.FormEvent<HTMLInputElement>): void {
    this.setState({ input: (e.target as HTMLInputElement).value });
  }

  render(): JSX.Element {
    const buttonText = window.location.pathname === '/' ? 'Lobby erstellen' : 'Spiel betreten';

    return (
      <Container>
        <SplitLayout>
          <Card>
            <header>
              <h1>Busfahrer</h1>
            </header>
            <section>
              <input value={this.state.input} onChange={this.onChange} minLength={3} maxLength={16} placeholder="Name" />
              {this.props.error !== '' && <small className="text-error">{this.props.error}</small>}
            </section>
            <footer>
              <button
                onClick={this.onClick}
                disabled={3 > this.state.input.length || this.state.input.length > 16}
                className="right success"
              >
                {buttonText}
              </button>
            </footer>
          </Card>
          <Card>
            <header>
              <h1>How to Play</h1>
            </header>
            <section>
              <h3>1. Runde: Austeilen</h3>
              <p>TODO</p>
              <h3>2. Runde: Pyramide</h3>
              <p>TODO</p>
              <h3>3. Runde: Busfahrer</h3>
              <p>TODO</p>
            </section>
          </Card>
        </SplitLayout>
      </Container>
    );
  }
}

export default NamePicker;
