import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import StarNestShader from './components/StarNestShader';
import CRTOverlay from './components/CRTOverlay';
import Lobby from './components/Lobby';
import GameCanvas from './components/GameCanvas';
import Scoreboard from './components/Scoreboard';
import GoalFlash from './components/GoalFlash';
import VictoryScreen from './components/VictoryScreen';
import { useGameState } from './hooks/useGameState';

function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { gameState, gameStats, myRole, roomFull, disconnected, enterRoom, castRematchVote } =
    useGameState();

  useEffect(() => {
    if (roomId) enterRoom(roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (roomFull) {
    return (
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '1.5rem',
          fontFamily: "'Press Start 2P', monospace",
          color: '#ff4444',
          textShadow: '0 0 16px #ff4444',
          fontSize: 'clamp(14px, 3vw, 24px)',
        }}
      >
        <div>PARTIDA COMPLETA</div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.8rem 1.5rem',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(9px, 1.5vw, 13px)',
            background: '#ff00ff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          VOLVER
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Share link banner */}
      {gameState?.phase === 'waiting' && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(7px, 1.2vw, 10px)',
            color: '#ff00ff',
            textShadow: '0 0 8px #ff00ff',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          title="Clic para copiar"
        >
          COMPARTE: {window.location.href}
          <br />
          <span style={{ color: '#555', fontSize: '0.8em' }}>(clic para copiar)</span>
        </div>
      )}

      {/* Game area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {gameState && (
          <>
            <GameCanvas gameState={gameState} />

            {/* HUD layered over canvas */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: gameState.phase === 'gameover' ? 'auto' : 'none',
              }}
            >
              <Scoreboard state={gameState} />
              <GoalFlash state={gameState} />

              {gameState.phase === 'gameover' && gameStats && (
                <VictoryScreen
                  state={gameState}
                  stats={gameStats}
                  myRole={myRole}
                  onRematch={castRematchVote}
                />
              )}
            </div>
          </>
        )}

        {!gameState && (
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              fontFamily: "'Press Start 2P', monospace",
              color: '#888',
              fontSize: 'clamp(9px, 1.5vw, 13px)',
              textAlign: 'center',
            }}
          >
            {disconnected ? (
              <>
                <div style={{ color: '#ff4444', marginBottom: '1rem' }}>JUGADOR DESCONECTADO</div>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '0.8rem 1.5rem',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    background: '#ff00ff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  VOLVER AL MENÚ
                </button>
              </>
            ) : (
              <div style={{ animation: 'pulse 1s ease-in-out infinite' }}>CONECTANDO...</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <>
      <StarNestShader />
      <CRTOverlay />

      <div style={{ position: 'relative', zIndex: 5, width: '100%', height: '100vh' }}>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </div>
    </>
  );
}
