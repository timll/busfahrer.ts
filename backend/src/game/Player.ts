import User from '../model/User';
import { PlayingCard, CardNumber, CardColor } from '../model/PlayingCard';

/**
 * Player Class
 * Adds game state to a user
 */
class Player {
  private user: User;
  private cards: PlayingCard[];
  private counter: number;

  constructor(user: User) {
    this.user = user;
    this.cards = [];
    this.counter = 0;
  }

  /**
   * Adds a card to a players hand
   * @param card
   */
  public addCard(card: PlayingCard): void {
    this.cards.push(card);
  }

  /**
   * Removes the first occurence of the given card
   * @returns true if card was removed; false if card is not in hand
   */
  public removeCard(card: PlayingCard): boolean {
    const i = this.cards.findIndex(handCard => handCard.number === card.number);

    if (i === -1) return false;

    this.cards.splice(i, 1);
    return true;
  }

  public getHand(): PlayingCard[] {
    return this.cards;
  }

  public resetHand(): void {
    this.cards = [];
  }

  public cardValue(): CardNumber {
    if (this.cards.length !== 1) {
      console.error('cardValue called with wrong card count!');
    }
    return this.cards[0].number;
  }

  public cardRange(): [CardNumber, CardNumber] {
    if (this.cards.length !== 2) {
      console.error('cardRange called with wrong card count!');
    }
    if (this.cards[0].number < this.cards[1].number) return [this.cards[0].number, this.cards[1].number];
    else return [this.cards[1].number, this.cards[0].number];
  }

  public cardSymbols(): CardColor[] {
    return this.cards.map((card) => card.color);
  }

  public cardNumbers(): CardNumber[] {
    return this.cards.map((card) => card.number);
  }

  public getUser(): User {
    return this.user;
  }

  public isActive(): boolean {
    return true;
  }

  public drinks(count: number): void {
    this.counter += count;
  }
}

export default Player;
