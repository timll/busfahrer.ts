/**
 * Represents a game update
 */
export default interface IGameUpdateEvent {
  action: GameUpdateAction;
  value: number;
}

/**
 * Possible GameUpdateEvent actions
 */
export enum GameUpdateAction {
  Start = 1,
  Predict, // deal or busfahrer
  Uncover, // pyramid uncover next card. only as admin.
  PlayCard, // pyramid let someone drink
}
