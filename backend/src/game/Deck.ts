import { DeckType } from '../model/DeckType';
import { PlayingCard } from '../model/PlayingCard';

/**
 * Card Deck
 */
class Deck {
  private deck: PlayingCard[];

  constructor(type: DeckType) {
    let start = 0;
    if (type === DeckType.small) start = 20;

    this.deck = [];

    for (let i = start; i < 52; i++) this.deck[i - start] = { color: Math.floor(i / 13), number: i % 13 };
  }

  /**
   * Removes card from deck
   * @returns drawn card
   */
  public drawCard(): PlayingCard {
    const i = Math.floor(Math.random() * this.deck.length);

    return this.deck.splice(i, 1)[0];
  }

  /**
   * Checks if deck is empty
   * @returns true if deck is empty
   */
  public isEmpty(): boolean {
    return this.deck.length === 0;
  }
}

export default Deck;
