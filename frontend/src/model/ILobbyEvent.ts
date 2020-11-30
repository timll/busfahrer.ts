import { RoomSettings, RoomPlayer } from './RoomTypes';

export default interface ILobbyEvent {
  id: string;
  settings: RoomSettings;
  players: RoomPlayer[];
  maxPlayers: number;
  admin: string;
}
