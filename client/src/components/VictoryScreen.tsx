import { GameState, GameStats, PlayerSide } from '@shared/types';

interface Props {
  state: GameState;
  stats: GameStats;
  myRole: PlayerSide | null;
  onRematch: () => void;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VictoryScreen({ state, stats, myRole, onRematch }: Props) {
  const { winner, rematchVotes } = state;
  if (!winner) return null;

  const iWon = myRole === winner;
  const winnerLabel = winner === 'p1' ? 'GUILLE' : 'BEER';
  const winnerImg = winner === 'p1' ? '/assets/guille.png' : '/assets/beer.png';
  const color = winner === 'p1' ? '#00ffff' : '#ffd700';

  const myVote = myRole ? rematchVotes[myRole] : false;
  const otherVote = myRole === 'p1' ? rematchVotes.p2 : rematchVotes.p1;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        zIndex: 30,
        fontFamily: "'Press Start 2P', monospace",
        animation: 'fadeIn 0.5s ease',
      }}
    >
      {/* Winner image — big & glowing */}
      <img
        src={winnerImg}
        alt={winnerLabel}
        style={{
          width: 'clamp(100px, 22vw, 200px)',
          height: 'clamp(100px, 22vw, 200px)',
          objectFit: 'contain',
          filter: `drop-shadow(0 0 24px ${color}) drop-shadow(0 0 48px ${color})`,
          animation: 'winnerPop 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      <div
        style={{
          fontSize: 'clamp(22px, 5vw, 52px)',
          color,
          textShadow: `0 0 16px ${color}, 0 0 32px ${color}`,
          animation: 'winnerPop 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {iWon ? 'GANASTE' : 'PERDISTE'}
      </div>

      <div style={{ fontSize: 'clamp(8px, 1.4vw, 13px)', color: '#aaa', textAlign: 'center', lineHeight: 2 }}>
        <div>GANADOR: <span style={{ color }}>{winnerLabel}</span></div>
        <div>DURACIÓN: {formatDuration(stats.durationMs)}</div>
        <div>REBOTES: {stats.bounces}</div>
        <div>GUILLE {stats.goals.p1} - {stats.goals.p2} BEER</div>
      </div>

      {/* Rematch */}
      <button
        onClick={onRematch}
        disabled={myVote}
        style={{
          marginTop: '0.5rem',
          padding: '0.8rem 2rem',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 'clamp(10px, 1.8vw, 16px)',
          background: myVote ? '#333' : '#ff00ff',
          color: '#fff',
          border: 'none',
          cursor: myVote ? 'default' : 'pointer',
          boxShadow: myVote ? 'none' : '0 0 20px #ff00ff',
          transition: 'all 0.2s',
          letterSpacing: '0.1em',
        }}
      >
        {myVote ? 'ESPERANDO...' : 'REMATCH'}
      </button>

      {myVote && (
        <div style={{ fontSize: 'clamp(7px, 1.2vw, 11px)', color: '#666' }}>
          {otherVote ? '¡AMBOS LISTOS!' : 'Esperando al otro jugador...'}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes winnerPop {
          from { transform: scale(0); opacity: 0 }
          to   { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
