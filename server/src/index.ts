import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { RoomManager } from './RoomManager';
import { EVENTS, PlayerInput } from '../../shared/types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Both `npm run dev` and `npm start` execute with cwd = server/,
// so paths are resolved relative to the current working directory
// (robust across ts-node dev mode and compiled dist/ production builds).
const projectRoot = path.resolve(process.cwd(), '..');

app.use('/assets', express.static(path.join(projectRoot, 'assets')));

// Production: serve built client
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(projectRoot, 'client/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on(EVENTS.JOIN_ROOM, (roomId: string) => {
    roomManager.joinRoom(socket, roomId);
  });

  socket.on(EVENTS.PLAYER_INPUT, (input: PlayerInput) => {
    roomManager.handleInput(socket, input);
  });

  socket.on(EVENTS.REMATCH_VOTE, () => {
    roomManager.handleRematch(socket);
  });

  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id}`);
    roomManager.handleDisconnect(socket);
  });
});

const PORT = Number(process.env.PORT ?? 3001);
httpServer.listen(PORT, () => {
  console.log(`🏓 Pong server running on http://localhost:${PORT}`);
});
