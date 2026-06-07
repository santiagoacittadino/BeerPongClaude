import {
  GameState,
  PlayerSide,
  PlayerInput,
  GamePhase,
  GameStats,
} from '../../shared/types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  BALL_RADIUS,
  BALL_SPEED_INITIAL,
  BALL_SPEED_MAX,
  BALL_SPEED_INCREMENT,
  MAX_BOUNCE_ANGLE,
  SCORE_TO_WIN,
  TICK_RATE,
  GOAL_PAUSE_MS,
  COUNTDOWN_SECONDS,
  P1_PADDLE_X,
  P2_PADDLE_X,
} from '../../shared/constants';

const TICK_MS = 1000 / TICK_RATE;

function makeBall(towardSide: PlayerSide): GameState['ball'] {
  // Always launch toward the player who just got scored on (or random at start)
  const dirX = towardSide === 'p1' ? -1 : 1;
  const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8; // ±22.5°
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx: dirX * BALL_SPEED_INITIAL * Math.cos(angle),
    vy: BALL_SPEED_INITIAL * Math.sin(angle),
  };
}

function initialState(): GameState {
  return {
    ball: makeBall(Math.random() < 0.5 ? 'p1' : 'p2'),
    paddles: {
      p1: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      p2: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    },
    score: { p1: 0, p2: 0 },
    phase: 'waiting',
    countdown: COUNTDOWN_SECONDS,
    winner: null,
    lastScorer: null,
    bounces: 0,
    startTime: 0,
    rematchVotes: { p1: false, p2: false },
  };
}

export class GameRoom {
  readonly roomId: string;
  private state: GameState;
  private inputs: Record<PlayerSide, PlayerInput> = {
    p1: { up: false, down: false },
    p2: { up: false, down: false },
  };
  private interval: ReturnType<typeof setInterval> | null = null;
  private goalTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private gameStartTime = 0;

  constructor(
    roomId: string,
    private onTick: (state: GameState) => void,
    private onGoal: (scorer: PlayerSide, state: GameState) => void,
    private onGameOver: (stats: GameStats, state: GameState) => void,
  ) {
    this.roomId = roomId;
    this.state = initialState();
  }

  getState(): GameState {
    return this.state;
  }

  startCountdown(): void {
    this.state.phase = 'countdown';
    this.state.countdown = COUNTDOWN_SECONDS;

    this.countdownInterval = setInterval(() => {
      this.state.countdown -= 1;
      this.onTick(this.state);
      if (this.state.countdown <= 0) {
        clearInterval(this.countdownInterval!);
        this.countdownInterval = null;
        this.startPlaying();
      }
    }, 1000);

    this.onTick(this.state);
  }

  private startPlaying(): void {
    this.state.phase = 'playing';
    this.gameStartTime = Date.now();
    this.state.startTime = this.gameStartTime;
    this.interval = setInterval(() => this.tick(), TICK_MS);
    this.onTick(this.state);
  }

  setInput(side: PlayerSide, input: PlayerInput): void {
    this.inputs[side] = input;
  }

  voteRematch(side: PlayerSide): boolean {
    this.state.rematchVotes[side] = true;
    const both = this.state.rematchVotes.p1 && this.state.rematchVotes.p2;
    if (both) this.reset();
    return both;
  }

  stop(): void {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
    if (this.goalTimer) { clearTimeout(this.goalTimer); this.goalTimer = null; }
    if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; }
  }

  private reset(): void {
    this.stop();
    this.state = initialState();
    this.inputs = { p1: { up: false, down: false }, p2: { up: false, down: false } };
    this.startCountdown();
  }

  private tick(): void {
    if (this.state.phase !== 'playing') return;

    this.movePaddles();
    this.moveBall();

    this.onTick(this.state);
  }

  private movePaddles(): void {
    for (const side of ['p1', 'p2'] as PlayerSide[]) {
      const pad = this.state.paddles[side];
      const inp = this.inputs[side];
      if (inp.up) pad.y -= PADDLE_SPEED;
      if (inp.down) pad.y += PADDLE_SPEED;
      pad.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, pad.y));
    }
  }

  private moveBall(): void {
    const b = this.state.ball;
    b.x += b.vx;
    b.y += b.vy;

    // Top / bottom wall bounce
    if (b.y - BALL_RADIUS <= 0) {
      b.y = BALL_RADIUS;
      b.vy = Math.abs(b.vy);
    } else if (b.y + BALL_RADIUS >= GAME_HEIGHT) {
      b.y = GAME_HEIGHT - BALL_RADIUS;
      b.vy = -Math.abs(b.vy);
    }

    // Paddle collisions
    if (b.vx < 0 && this.collidesWithPaddle(b, 'p1')) {
      this.handlePaddleBounce('p1');
    } else if (b.vx > 0 && this.collidesWithPaddle(b, 'p2')) {
      this.handlePaddleBounce('p2');
    }

    // Goal detection
    if (b.x - BALL_RADIUS < 0) {
      this.handleGoal('p2');
    } else if (b.x + BALL_RADIUS > GAME_WIDTH) {
      this.handleGoal('p1');
    }
  }

  private collidesWithPaddle(
    b: GameState['ball'],
    side: PlayerSide,
  ): boolean {
    const padX = side === 'p1' ? P1_PADDLE_X : P2_PADDLE_X;
    const padY = this.state.paddles[side].y;

    const ballLeft = b.x - BALL_RADIUS;
    const ballRight = b.x + BALL_RADIUS;
    const ballTop = b.y - BALL_RADIUS;
    const ballBottom = b.y + BALL_RADIUS;

    const padRight = padX + PADDLE_WIDTH;
    const padBottom = padY + PADDLE_HEIGHT;

    return (
      ballRight >= padX &&
      ballLeft <= padRight &&
      ballBottom >= padY &&
      ballTop <= padBottom
    );
  }

  private handlePaddleBounce(side: PlayerSide): void {
    const b = this.state.ball;
    const padY = this.state.paddles[side].y;
    const padCenterY = padY + PADDLE_HEIGHT / 2;

    // Normalized hit position: -1 (top) to 1 (bottom)
    const hitPos = Math.max(-1, Math.min(1, (b.y - padCenterY) / (PADDLE_HEIGHT / 2)));
    const bounceAngle = hitPos * MAX_BOUNCE_ANGLE;

    const currentSpeed = Math.min(
      Math.sqrt(b.vx * b.vx + b.vy * b.vy) + BALL_SPEED_INCREMENT,
      BALL_SPEED_MAX,
    );

    const dirX = side === 'p1' ? 1 : -1;
    b.vx = dirX * currentSpeed * Math.cos(bounceAngle);
    b.vy = currentSpeed * Math.sin(bounceAngle);

    // Reposition ball outside paddle to prevent sticking
    if (side === 'p1') {
      b.x = P1_PADDLE_X + PADDLE_WIDTH + BALL_RADIUS + 1;
    } else {
      b.x = P2_PADDLE_X - BALL_RADIUS - 1;
    }

    this.state.bounces += 1;
  }

  private handleGoal(scorer: PlayerSide): void {
    if (this.state.phase !== 'playing') return;

    clearInterval(this.interval!);
    this.interval = null;

    this.state.phase = 'goal';
    this.state.score[scorer] += 1;
    this.state.lastScorer = scorer;

    this.onGoal(scorer, this.state);

    if (this.state.score[scorer] >= SCORE_TO_WIN) {
      this.goalTimer = setTimeout(() => {
        this.state.phase = 'gameover';
        this.state.winner = scorer;
        const stats: GameStats = {
          winner: scorer,
          durationMs: Date.now() - this.gameStartTime,
          bounces: this.state.bounces,
          goals: { ...this.state.score },
        };
        this.onGameOver(stats, this.state);
      }, GOAL_PAUSE_MS);
    } else {
      this.goalTimer = setTimeout(() => {
        const loser: PlayerSide = scorer === 'p1' ? 'p2' : 'p1';
        this.state.ball = makeBall(loser);
        this.state.paddles.p1.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        this.state.paddles.p2.y = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        this.state.phase = 'playing';
        this.interval = setInterval(() => this.tick(), TICK_MS);
        this.onTick(this.state);
      }, GOAL_PAUSE_MS);
    }
  }
}
