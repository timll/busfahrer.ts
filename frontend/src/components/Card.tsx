import React from 'react';

const Card = (props: { children: React.ReactNode; className?: string }): JSX.Element => {
  return <article className={`card ${props.className}`}>{props.children}</article>;
};

export default Card;
