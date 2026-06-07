import { useEffect, useState } from 'react';
import { GameState, PlayerSide } from '@shared/types';

interface Props {
  state: GameState;
}

export default function GoalFlash({ state }: Props) {
  const [visible, setVisible] = useState(false);
  const [scorer, setScorer] = useState<PlayerSide | null>(null);

  useEffect(() => {
    if (state.phase === 'goal' && state.lastScorer) {
      setScorer(state.lastScorer);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.lastScorer, state.score.p1, state.score.p2]);

  if (!visible || !scorer) return null;

  const isP1 = scorer === 'p1';
  const message = isP1 ? 'YE YE YE' : "IT'S BEER TIME";
  const color = isP1 ? '#00ffff' : '#ffd700';

  return (
    <>
      {/* Screen flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: color,
          opacity: 0.18,
          zIndex: 20,
          pointerEvents: 'none',
          animation: 'flashIn 0.12s ease-out',
        }}
      />
      {/* Goal message */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 21,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(20px, 5vw, 48px)',
            color,
            textShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}`,
            animation: 'goalPop 0.3s cubic-bezier(0.22,1,0.36,1)',
            letterSpacing: '0.05em',
          }}
        >
          {message}
        </span>
      </div>

      <style>{`
        @keyframes flashIn { from { opacity: 0.5 } to { opacity: 0.18 } }
        @keyframes goalPop { from { transform: scale(0.3); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </>
  );
}
