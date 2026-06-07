import { GameState } from '@shared/types';

interface Props {
  state: GameState;
}

export default function Scoreboard({ state }: Props) {
  const { score, phase, countdown } = state;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '0.6rem 1rem',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 'clamp(10px, 2vw, 18px)',
        color: '#fff',
        textShadow: '0 0 12px #ff00ff, 0 0 24px #ff00ff',
        zIndex: 10,
        userSelect: 'none',
        letterSpacing: '0.05em',
      }}
    >
      <span style={{ color: '#00ffff', textShadow: '0 0 12px #00ffff' }}>GUILLE</span>
      <span style={{ color: '#ff00ff', fontSize: '1.4em' }}>{score.p1}</span>
      <span style={{ color: '#fff', opacity: 0.5 }}>—</span>
      <span style={{ color: '#ff00ff', fontSize: '1.4em' }}>{score.p2}</span>
      <span style={{ color: '#ffd700', textShadow: '0 0 12px #ffd700' }}>BEER</span>

      {phase === 'countdown' && countdown > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(28px, 6vw, 56px)',
            color: '#fff',
            textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
            animation: 'pulse 0.8s ease-in-out infinite',
          }}
        >
          {countdown}
        </span>
      )}

      {phase === 'waiting' && (
        <span
          style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(8px, 1.5vw, 13px)',
            color: '#aaa',
            whiteSpace: 'nowrap',
          }}
        >
          ESPERANDO JUGADOR 2…
        </span>
      )}
    </div>
  );
}
