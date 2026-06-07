export type PlayerSide = 'p1' | 'p2';
export type GamePhase =
  | 'waiting'
  | 'countdown'
  | 'playing'
  | 'goal'
  | 'gameover';

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PaddleState {
  y: number; // top-left Y of the paddle sprite
}

export interface GameState {
  ball: Ball;
  paddles: { p1: PaddleState; p2: PaddleState };
  score: { p1: number; p2: number };
  phase: GamePhase;
  countdown: number; // 3..0 during countdown phase
  winner: PlayerSide | null;
  lastScorer: PlayerSide | null;
  bounces: number;
  startTime: number; // ms epoch when playing started
  rematchVotes: { p1: boolean; p2: boolean };
}

export interface GameStats {
  winner: PlayerSide;
  durationMs: number;
  bounces: number;
  goals: { p1: number; p2: number };
}

export interface RoomInfo {
  roomId: string;
  playerCount: number;
  myRole: PlayerSide | 'spectator';
}

// ─── Socket event names ───────────────────────────────────────────────────────
export const EVENTS = {
  // client → server
  JOIN_ROOM: 'join-room',
  PLAYER_INPUT: 'player-input',
  REMATCH_VOTE: 'rematch-vote',

  // server → client
  ROOM_JOINED: 'room-joined',
  ROOM_FULL: 'room-full',
  GAME_STATE: 'game-state',
  GOAL_SCORED: 'goal-scored',
  GAME_OVER: 'game-over',
  PLAYER_DISCONNECTED: 'player-disconnected',
} as const;

export interface PlayerInput {
  up: boolean;
  down: boolean;
}
