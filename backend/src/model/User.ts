import { Socket } from 'socket.io';
import Room from './Room';

/**
 * Represents a user connected to the socket.io server
 */
class User {
  private name: string;
  private room: string;
  private socket: Socket;

  constructor(name: string, socket: Socket) {
    this.name = name;
    this.socket = socket;
    this.room = '';
  }

  /**
   * Returns the socket for a user
   * @returns socket
   */
  public getSocket(): Socket {
    return this.socket;
  }

  public getId(): string {
    return this.socket.id;
  }

  public getRoomId(): string {
    return this.room;
  }

  /**
   * Returns if the id belongs to this user
   * @param id id to compare
   * @returns true if the uuid equals to the uuid of this user
   */
  public equals(user: User): boolean {
    return this.socket.id === user.getId();
  }

  /**
   * Returns the name of this user
   * @returns name of this user
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Sets the name of this user
   * @param name desired name
   */
  // public setName(name: string): void {
  //     this.name = name;
  // }

  public joinRoom(room: Room): void {
    this.socket.join(room.getId());
    this.room = room.getId();
  }
}

export default User;
