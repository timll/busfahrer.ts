import React from 'react';
import GameCard, { PlayingCard, CardColor, CardNumber } from './GameCard';

const Busfahrer = (props: { cards: PlayingCard[] }): JSX.Element => {
  const cards = props.cards;
  cards.push(...Array(5 - props.cards.length).fill({ color: CardColor.Back, number: CardNumber.Ace }));
  console.log(cards);
  return (
    <div className="busfahrer">
      {cards.map((card, i) => (
        <GameCard key={i} card={card} />
      ))}
    </div>
  );
};

export default Busfahrer;
