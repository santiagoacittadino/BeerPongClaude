export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PADDLE_WIDTH = 72;
export const PADDLE_HEIGHT = 72;
export const PADDLE_OFFSET_X = 28; // distance from wall to paddle left edge
export const PADDLE_SPEED = 8;

export const BALL_RADIUS = 10;
export const BALL_SPEED_INITIAL = 5.5;
export const BALL_SPEED_MAX = 18;
export const BALL_SPEED_INCREMENT = 0.3;
export const MAX_BOUNCE_ANGLE = (5 * Math.PI) / 12; // 75 degrees

export const SCORE_TO_WIN = 3;
export const TICK_RATE = 60; // server ticks per second
export const GOAL_PAUSE_MS = 2000;
export const COUNTDOWN_SECONDS = 3;

// P1 paddle left-edge X
export const P1_PADDLE_X = PADDLE_OFFSET_X;
// P2 paddle left-edge X
export const P2_PADDLE_X = GAME_WIDTH - PADDLE_OFFSET_X - PADDLE_WIDTH;
