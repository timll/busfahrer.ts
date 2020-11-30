import { PlayingCard } from './PlayingCard';

export default interface IGameEvent {
  action: GameAction;
  value: number | PlayingCard;
}

export enum GameAction {
  StartGame = 1,
  StateChange,
  AskCard,
  GiveCard,
  SayEvent,
  DrinkEvent,
  GiveEvent,
  UncoverCard,
  BusfahrerCard,
}
