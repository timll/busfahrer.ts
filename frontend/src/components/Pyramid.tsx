import React from 'react';
import GameCard, { PlayingCard, CardNumber, CardColor } from './GameCard';
import { triangularNumber } from '../utils/utils';

const Pyramid = (props: { rows: number; cards: PlayingCard[] }): JSX.Element => {
  const pyramid = [];

  for (let i = 0; i < props.rows; i++) {
    const rows = [];

    for (let j = 0; j < i + 1; j++) {
      const n = triangularNumber(i);
      if (n + j < props.cards.length) rows.push(<GameCard card={props.cards[n + j]} />);
      else rows.push(<GameCard card={{ color: CardColor.Back, number: CardNumber.Ace }} />);
    }

    pyramid.push(<div className="pyramid-row">{rows}</div>);
  }

  return <div className="pyramid">{pyramid}</div>;
};

export default Pyramid;
