export default interface IGameEvent {
  action: GameAction;
  value: any;
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
