import User from './User';
import Game from '../game/Game';
import { RoomSettings, RoomPlayer } from './RoomTypes';

/**
 * Represents the lobby
 */
class Room {
  private room: SocketIO.Room;
  private id: string;
  private admin: User;
  private settings: RoomSettings;

  private game?: Game;

  constructor(admin: User, io: SocketIO.Server) {
    // Generate random id until it is free
    do {
      this.id = Math.random().toString(36).substr(2);
    } while (io.sockets.adapter.rooms[this.id] !== undefined);
    this.admin = admin;
    admin.joinRoom(this);
    this.room = io.sockets.adapter.rooms[this.id];
    this.settings = {
      gameDeck: 1,
      pyramidDouble: false,
      pyramidTriple: false,
      busfahrerDeck: 1,
    };
  }

  public setGame(game: Game): void {
    this.game = game;
  }

  public getGame(): Game | undefined {
    return this.game;
  }

  /**
   * Returns the id of the admin
   * @returns admin socket id
   */
  public getAdminId(): string {
    return this.admin.getId();
  }

  /**
   * Sets the admin
   * @param user
   */
  public setAdmin(user: User): void {
    this.admin = user;
  }

  /**
   * Selects the first user as the new admin
   * @param users user dictionary
   */
  public findAdmin(users: { [id: string]: User }): void {
    const ids = Object.keys(this.room.sockets);
    if (ids.length === 0) return;
    this.setAdmin(users[ids[0]]);
  }

  /**
   * Sets the given settings
   * @param settings room settings
   */
  public setSettings(settings: RoomSettings): void {
    this.settings = settings;
  }

  /**
   * Returns the room settings
   * @returns room settings
   */
  public getSettings(): RoomSettings {
    return this.settings;
  }

  /**
   * Calculates the maximum player count based on the room settings
   * @returns maximum player count
   */
  public maxPlayers(): number {
    const deckSize = this.settings.gameDeck ? 52 : 32;
    let numRows = 5;
    let numRounds = 4;

    if (deckSize == 32) {
      if (numRows === 4) {
        return 5;
      } else {
        if (numRounds == 4) {
          return 4;
        } else {
          return 3;
        }
      }
    } else {
      if (numRows === 4) {
        if (numRounds == 4) {
          return 10;
        } else {
          return 8;
        }
      } else {
        if (numRounds == 4) {
          return 9;
        } else {
          return 7;
        }
      }
    }
  }

  /**
   * Returns if the room is full
   * @returns true if full
   */
  public isFull(): boolean {
    return this.room.length >= this.maxPlayers();
  }

  /**
   * Returns a list of all users
   * @param users user dictionary
   */
  public getUserList(users: { [id: string]: User }): RoomPlayer[] {
    return Object.keys(this.room.sockets).map((id) => ({
      id,
      name: users[id].getName(),
      isAdmin: this.isAdmin(users[id]),
    }));
  }

  public getUsers(users: { [id: string]: User }): User[] {
    return Object.keys(this.room.sockets).map((id) => users[id]);
  }

  /**
   * Checks if the given is the admin
   * @param user true if user is admin
   */
  public isAdmin(user: User): boolean {
    return this.admin.equals(user);
  }

  /**
   * Returns if the room is empty
   * @returns true if empty
   */
  public isEmpty(): boolean {
    return Object.keys(this.room.sockets).length === 0;
  }

  /**
   * Returns if a name is unique for this room
   * @param name name to be checked
   * @param users user dict
   */
  public isUniqueName(name: string, users: { [id: string]: User }): boolean {
    return name !== undefined && Object.keys(this.room.sockets).filter((id) => users[id].getName() === name).length === 0;
  }

  /**
   * Returns the ID of the room
   * @returns id
   */
  public getId(): string {
    return this.id;
  }
}

export default Room;
