import React from 'react';
import Card from './Card';
import { QuestionType } from './GameHand';

export const SayEvent = (props: { name: string; round: number; choice: number }): JSX.Element => {
  let questions: string[] = ['wtf', 'wtf'];
  switch (props.round) {
    case QuestionType.redBlack:
      questions = ['Rot', 'Schwarz'];
      break;
    case QuestionType.lowerHigher:
      questions = ['Höher', 'Tiefer'];
      break;
    case QuestionType.inOut:
      questions = ['Innerhalb', 'Außerhalb'];
      break;
    case QuestionType.symbolEqual:
      questions = ['Symbol gleich', 'Symbol anders'];
      break;
    case QuestionType.numberEqual:
      questions = ['Zahl gleich', 'Zahl anders'];
      break;
  }

  return (
    <Card className="eventcard">
      <section>
        <span role="img" aria-label="Say">
          💬
        </span>{' '}
        <span>{props.name}</span>: {questions[props.choice]}.
      </section>
    </Card>
  );
};

export const DrinkEvent = (props: { name: string; shots: number }): JSX.Element => {
  return (
    <Card className="eventcard">
      <section>
        <span role="img" aria-label="Cheers">
          🍺
        </span>{' '}
        <span>{props.name}</span> trinkt selbst {props.shots} {props.shots === 1 ? 'Schluck' : 'Schlücke'}.
      </section>
    </Card>
  );
};

export const GiveEvent = (props: { name: string; receiver: string; shots: number }): JSX.Element => {
  return (
    <Card className="eventcard">
      <section>
        <span role="img" aria-label="Cheers">
          🍻
        </span>{' '}
        <span>{props.name}</span>: {props.receiver}, trink {props.shots} {props.shots === 1 ? 'Schluck' : 'Schlücke'}!
      </section>
    </Card>
  );
};
