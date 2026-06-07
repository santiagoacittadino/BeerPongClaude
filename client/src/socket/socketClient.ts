import { io, Socket } from 'socket.io-client';
import { EVENTS, PlayerInput } from '@shared/types';

const socket: Socket = io({ autoConnect: false });

export function connect(): void {
  if (!socket.connected) socket.connect();
}

export function joinRoom(roomId: string): void {
  socket.emit(EVENTS.JOIN_ROOM, roomId.toUpperCase());
}

export function sendInput(input: PlayerInput): void {
  socket.emit(EVENTS.PLAYER_INPUT, input);
}

export function sendRematchVote(): void {
  socket.emit(EVENTS.REMATCH_VOTE);
}

export { socket };
