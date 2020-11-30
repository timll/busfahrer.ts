export type PlayingCard = {
  number: CardNumber;
  color: CardColor;
};

export enum CardNumber {
  Ace = 0,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
}

export enum CardColor {
  Spade = 0,
  Heart,
  Club,
  Diamond,
  Back,
}
