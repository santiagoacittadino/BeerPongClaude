import { Server, Socket } from 'socket.io';
import { GameRoom } from './GameRoom';
import { EVENTS, PlayerInput, PlayerSide } from '../../shared/types';

interface RoomEntry {
  room: GameRoom;
  players: { p1?: string; p2?: string }; // socket ids
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export class RoomManager {
  private rooms = new Map<string, RoomEntry>();
  /** socket id → roomId */
  private socketRoom = new Map<string, string>();
  /** socket id → player side */
  private socketSide = new Map<string, PlayerSide>();

  constructor(private io: Server) {}

  joinRoom(socket: Socket, roomId: string): void {
    const id = roomId.toUpperCase();

    if (this.rooms.has(id)) {
      const entry = this.rooms.get(id)!;
      const { players } = entry;

      if (players.p1 && players.p2) {
        socket.emit(EVENTS.ROOM_FULL);
        return;
      }

      const side: PlayerSide = players.p1 ? 'p2' : 'p1';
      players[side] = socket.id;
      this.socketRoom.set(socket.id, id);
      this.socketSide.set(socket.id, side);

      socket.join(id);
      socket.emit(EVENTS.ROOM_JOINED, { roomId: id, myRole: side });

      // Both players present → start countdown
      if (players.p1 && players.p2) {
        entry.room.startCountdown();
      }
    } else {
      // Create new room
      const room = new GameRoom(
        id,
        (state) => this.io.to(id).emit(EVENTS.GAME_STATE, state),
        (scorer, state) => this.io.to(id).emit(EVENTS.GOAL_SCORED, { scorer, state }),
        (stats, state) => this.io.to(id).emit(EVENTS.GAME_OVER, { stats, state }),
      );

      const entry: RoomEntry = { room, players: { p1: socket.id } };
      this.rooms.set(id, entry);
      this.socketRoom.set(socket.id, id);
      this.socketSide.set(socket.id, 'p1');

      socket.join(id);
      socket.emit(EVENTS.ROOM_JOINED, { roomId: id, myRole: 'p1' });
    }
  }

  handleInput(socket: Socket, input: PlayerInput): void {
    const roomId = this.socketRoom.get(socket.id);
    const side = this.socketSide.get(socket.id);
    if (!roomId || !side) return;

    this.rooms.get(roomId)?.room.setInput(side, input);
  }

  handleRematch(socket: Socket): void {
    const roomId = this.socketRoom.get(socket.id);
    const side = this.socketSide.get(socket.id);
    if (!roomId || !side) return;

    const entry = this.rooms.get(roomId);
    if (!entry) return;

    const accepted = entry.room.voteRematch(side);
    if (accepted) {
      // State update is handled by room's onTick callback
    } else {
      // Broadcast partial vote so both see "waiting for other player"
      const state = entry.room.getState();
      this.io.to(roomId).emit(EVENTS.GAME_STATE, state);
    }
  }

  handleDisconnect(socket: Socket): void {
    const roomId = this.socketRoom.get(socket.id);
    if (!roomId) return;

    const entry = this.rooms.get(roomId);
    if (entry) {
      entry.room.stop();
      const side = this.socketSide.get(socket.id);
      if (side) delete entry.players[side];

      this.io.to(roomId).emit(EVENTS.PLAYER_DISCONNECTED, { side });

      // Clean up empty rooms
      if (!entry.players.p1 && !entry.players.p2) {
        this.rooms.delete(roomId);
      }
    }

    this.socketRoom.delete(socket.id);
    this.socketSide.delete(socket.id);
  }
}
