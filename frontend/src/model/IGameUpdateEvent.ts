export default interface IGameUpdateEvent {
  type: GameUpdateAction;
  value: number;
}

export enum GameUpdateAction {
  Start = 1,
  Predict,
  Uncover,
  PlayCard,
}
