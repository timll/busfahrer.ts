import React from 'react';

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

const GameCard = (props: { card: PlayingCard; playable?: boolean; onClick?: any }): JSX.Element => {
  if (props.card.color === CardColor.Back) return <img className="cardImage" src={`./cards/back.svg`} alt="covered Card" />;

  return (
    <img
      className={`cardImage ${props.playable ? 'isPlayable' : ''}`}
      src={`./cards/${(props.card.color * 13 + props.card.number).toString().padStart(2, '0')}.svg`}
      alt="uncovered Card"
      onClick={props.onClick}
    />
  );
};

export default GameCard;
