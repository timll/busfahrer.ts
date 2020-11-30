import express from 'express';
import * as http from 'http';
import socketIO from 'socket.io';
import Room from './model/Room';
import User from './model/User';
import { IJoinEvent } from './model/IJoinEvent';
import ILobbyUpdateEvent, { LobbyUpdateActions } from './model/ILobbyUpdateEvent';
import IGameUpdateEvent, { GameUpdateAction } from './model/IGameUpdateEvent';
import { RoomSettings } from './model/RoomTypes';
import Game from './game/Game';

/**
 * Express and socket.io server
 */
class Server {
  public static readonly PORT: number = 3013;

  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: string | number;

  private rooms: { [id: string]: Room };
  private users: { [id: string]: User };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || Server.PORT;
    this.app.set('port', this.port);
    this.server = http.createServer(this.app);
    this.server.listen(this.port);
    this.io = socketIO(this.server);

    this.rooms = {};
    this.users = {};
  }

  /**
   * Starts the socket.io server
   */
  public listen(): void {
    this.io.on('connection', (socket: socketIO.Socket) => {
      console.log('ID %s connected.', socket.id);

      socket.on('join', (e: IJoinEvent) => {
        this.onJoin(socket, e);
      });

      socket.on('lobbyUpdateEvent', (e: ILobbyUpdateEvent) => {
        this.onLobbyUpdate(socket, e);
      });

      socket.on('gameUpdateEvent', (e: IGameUpdateEvent) => {
        this.onGameUpdate(socket, e);
      });

      socket.on('disconnect', () => {
        this.onDisconnect(socket);
      });
    });
  }

  /**
   * Delivers the static files
   */
  public serve(): void {
    this.app.get('/', (req: express.Request, res: express.Response) => {
      res.sendFile('/index.html');
    });
  }

  /**
   * Handle join
   * @param socket socket to client
   * @param e join event
   */
  private onJoin(socket: socketIO.Socket, e: IJoinEvent): void {
    if (e.name.length < 3 || e.name.length > 16) {
      console.log('ID %s bypassed the name length', socket.id);
      socket.emit('errorMessage', { message: 'length' });
      return;
    }

    const user = new User(e.name, socket);

    let room: Room;

    // Joined without room id => assign new room
    if (e.room === '') {
      room = new Room(user, this.io);
      this.rooms[room.getId()] = room; // remember room
    } else {
      room = this.rooms[e.room];

      // Room doesn't exist
      if (room === undefined) {
        console.log('ID %s wanted to join the nonexistent room %s!', socket.id, e.room);
        socket.emit('errorEvent', { code: 'nonexist' });
        return;
      }

      // Name isn't valid
      if (!room.isUniqueName(e.name, this.users)) {
        console.log('ID %s had an invalid name: %s!', socket.id, e.name);
        // length is already checked client-side, so only duplicate can happen for a valid frontend client
        socket.emit('errorEvent', { code: 'duplicate' });
        return;
      }

      // Room has no free slots
      if (room.isFull()) {
        console.log('ID %s tried to join a full room', e.name);
        socket.emit('errorEvent', { code: 'full' });
        return;
      }

      user.joinRoom(room);
    }

    this.users[socket.id] = user; // remember user by its socket id
    console.log('ID %s is named %s', socket.id, user.getName());

    const updatedUsers = room.getUserList(this.users);
    socket.emit('lobbyEvent', {
      id: room.getId(),
      settings: room.getSettings(),
      players: updatedUsers,
      maxPlayers: room.maxPlayers(),
      admin: room.getAdminId(),
    });
    socket.to(room.getId()).emit('lobbyEvent', {
      id: room.getId(),
      players: updatedUsers,
    });
  }

  /**
   * Handle update in lobby
   * @param socket socket requesting the update
   * @param e lobby update event
   */
  private onLobbyUpdate(socket: socketIO.Socket, e: ILobbyUpdateEvent): void {
    const user = this.users[socket.id];
    const room = this.rooms[user.getRoomId()];

    if (user === undefined || room === undefined) {
      socket.emit('errorEvent', { code: 'unknown' });
    }

    // check privileges
    if (!room.isAdmin(user)) return;

    switch (e.action) {
      case LobbyUpdateActions.makeAdmin: {
        const affectedUser = this.users[e.value as string];

        if (affectedUser === undefined) return;

        room.setAdmin(affectedUser);

        this.io.in(room.getId()).emit('lobbyEvent', {
          id: room.getId(),
          admin: room.getAdminId(),
        });
        break;
      }
      case LobbyUpdateActions.kickPlayer: {
        const affectedUser = this.users[e.value as string];

        if (affectedUser === undefined) return;
        const kickSocket = affectedUser.getSocket();
        kickSocket.leave(room.getId());

        // inform kicked user
        kickSocket.emit('errorEvent', { code: 'kick' });

        // update player list for the rest
        this.io.in(room.getId()).emit('lobbyEvent', {
          id: room.getId(),
          players: room.getUserList(this.users),
        });
        break;
      }
      case LobbyUpdateActions.changeSettings: {
        room.setSettings(e.value as RoomSettings);

        // propagate new settings
        socket.to(room.getId()).emit('lobbyEvent', {
          id: room.getId(),
          settings: room.getSettings(),
        });
        break;
      }
    }
  }

  /**
   * Handle user action in game
   * @param socket client socket
   */
  private onGameUpdate(socket: socketIO.Socket, e: IGameUpdateEvent): void {
    const user = this.users[socket.id];
    const room = this.rooms[user.getRoomId()];

    switch (e.action) {
      case GameUpdateAction.Start: {
        if (room.getAdminId() !== user.getId()) return;
        const users = room.getUsers(this.users);
        const game = new Game(this.io, room, users, 4, 5, room.getSettings()['gameDeck']);
        room.setGame(game);
        game.start();
        break;
      }
      default: {
        const game = room.getGame();
        if (!game) return;
        game.gameUpdateEvent(socket, e);
        break;
      }
    }
  }

  /**
   * Cleanup on disconnect
   * @param socket disconnecting socket
   */
  private onDisconnect(socket: socketIO.Socket): void {
    console.log('ID %s disconnected', socket.id);

    const user = this.users[socket.id];
    // nothing to clean up
    if (user === undefined) return;
    delete this.users[socket.id];

    const roomId = user.getRoomId();
    const room = this.rooms[roomId];

    // no need to cleanup the room
    if (room === undefined) return;

    const wasAdmin = room.isAdmin(user);
    // handle leaving admin
    if (wasAdmin) {
      console.log('Selecting new admin for room %s.', roomId);
      room.findAdmin(this.users);
      this.io.in(room.getId()).emit('lobbyEvent', {
        id: room.getId(),
        admin: room.getAdminId(),
        players: room.getUserList(this.users),
      });
    }

    // cleanup room if empty
    if (room.isEmpty()) {
      console.log('Removing empty room %s.', roomId);
      delete this.rooms[roomId];
    }
  }
}

export default Server;
