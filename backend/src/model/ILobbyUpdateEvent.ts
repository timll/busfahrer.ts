import { RoomSettings } from './RoomTypes';

/**
 * Represents a Lobby Update
 */
export default interface ILobbyUpdateEvent {
  action: LobbyUpdateActions;
  value: RoomSettings | string;
}

/**
 * Possible LobbyUpdateEvent Actions
 */
export enum LobbyUpdateActions {
  makeAdmin = 1,
  kickPlayer,
  changeSettings,
}
