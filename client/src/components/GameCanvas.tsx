import { useEffect, useRef } from 'react';
import { GameState } from '@shared/types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  P1_PADDLE_X,
  P2_PADDLE_X,
} from '@shared/constants';
import { audioManager } from '../audio/audioManager';

const TRAIL_LEN = 18;

interface Props {
  gameState: GameState;
}

function loadImage(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

export default function GameCanvas({ gameState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(gameState);
  const trailRef = useRef<Array<{ x: number; y: number }>>([]);
  const guilleImg = useRef(loadImage('/assets/guille.png'));
  const beerImg = useRef(loadImage('/assets/beer.png'));
  const prevPhaseRef = useRef(gameState.phase);

  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  // Sound side-effects on phase changes
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const cur = gameState.phase;
    if (prev !== cur) {
      if (cur === 'playing' && prev === 'countdown') audioManager.playStart();
      prevPhaseRef.current = cur;
    }
  }, [gameState.phase]);

  // Bounce sound
  const prevBouncesRef = useRef(gameState.bounces);
  useEffect(() => {
    if (gameState.bounces > prevBouncesRef.current) {
      audioManager.playBounce();
    }
    prevBouncesRef.current = gameState.bounces;
  }, [gameState.bounces]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let raf: number;

    function resize() {
      // Maintain 4:3 aspect, filling the container
      const parent = canvas.parentElement!;
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      const aspect = GAME_WIDTH / GAME_HEIGHT;
      if (pw / ph > aspect) {
        canvas.style.height = '100%';
        canvas.style.width = `${ph * aspect}px`;
      } else {
        canvas.style.width = '100%';
        canvas.style.height = `${pw / aspect}px`;
      }
      canvas.width = GAME_WIDTH;
      canvas.height = GAME_HEIGHT;
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const state = stateRef.current;
      const ctx = canvas.getContext('2d')!;

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Center dashed line
      ctx.save();
      ctx.setLineDash([16, 12]);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(GAME_WIDTH / 2, 0);
      ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
      ctx.stroke();
      ctx.restore();

      if (state.phase === 'playing' || state.phase === 'goal' || state.phase === 'gameover') {
        // Update trail
        const ball = state.ball;
        trailRef.current.push({ x: ball.x, y: ball.y });
        if (trailRef.current.length > TRAIL_LEN) trailRef.current.shift();

        // Draw trail
        for (let i = 0; i < trailRef.current.length; i++) {
          const alpha = (i / trailRef.current.length) * 0.55;
          const radius = BALL_RADIUS * (0.3 + (i / trailRef.current.length) * 0.7);
          const pt = trailRef.current[i];
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#ff00ff';
          ctx.fillStyle = '#ff88ff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw ball with glow
        ctx.save();
        ctx.shadowBlur = 32;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const grd = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_RADIUS * 2.5);
        grd.addColorStop(0, 'rgba(255,255,255,0.3)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw paddles (sprites)
      drawPaddle(ctx, state.paddles.p1.y, P1_PADDLE_X, guilleImg.current, '#00ffff');
      drawPaddle(ctx, state.paddles.p2.y, P2_PADDLE_X, beerImg.current, '#ffd700');

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  );
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  img: HTMLImageElement,
  glowColor: string,
) {
  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = glowColor;

  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
  } else {
    // Fallback rect if image not yet loaded
    ctx.fillStyle = glowColor;
    ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
  }
  ctx.restore();
}
