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

// Locate the project root by walking up from this file until we find the
// `assets/` folder. This is robust regardless of whether we're running the
// TS source directly (tsx, __dirname = server/src) or the compiled output
// (node, __dirname = server/dist/server/src), and regardless of cwd.
function findProjectRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (require('fs').existsSync(path.join(dir, 'assets'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error(`Could not locate project root (assets/) starting from ${start}`);
}

const projectRoot = findProjectRoot(__dirname);

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
