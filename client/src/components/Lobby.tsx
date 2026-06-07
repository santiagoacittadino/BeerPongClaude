import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function genRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Lobby() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const createRoom = () => {
    const id = genRoomId();
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length >= 4) navigate(`/room/${code}`);
  };

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
        gap: '2rem',
        fontFamily: "'Press Start 2P', monospace",
        color: '#fff',
        textAlign: 'center',
        padding: '1rem',
      }}
    >
      {/* Title */}
      <div>
        <div
          style={{
            fontSize: 'clamp(18px, 4vw, 40px)',
            color: '#ff00ff',
            textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
            marginBottom: '0.4rem',
            letterSpacing: '0.05em',
          }}
        >
          GUILLE vs BEER
        </div>
        <div style={{ fontSize: 'clamp(8px, 1.5vw, 13px)', color: '#888' }}>
          PONG MULTIJUGADOR EN TIEMPO REAL
        </div>
      </div>

      {/* Player portraits */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/assets/guille.png"
            alt="Guille"
            style={{ width: 80, height: 80, filter: 'drop-shadow(0 0 12px #00ffff)', imageRendering: 'pixelated' }}
          />
          <span style={{ fontSize: '10px', color: '#00ffff' }}>GUILLE</span>
          <span style={{ fontSize: '8px', color: '#555' }}>W / S</span>
        </div>

        <span style={{ fontSize: 'clamp(14px, 3vw, 28px)', color: '#ff00ff' }}>VS</span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/assets/beer.png"
            alt="Beer"
            style={{ width: 80, height: 80, filter: 'drop-shadow(0 0 12px #ffd700)', imageRendering: 'pixelated' }}
          />
          <span style={{ fontSize: '10px', color: '#ffd700' }}>BEER</span>
          <span style={{ fontSize: '8px', color: '#555' }}>↑ / ↓</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 'min(300px, 80vw)' }}>
        <button
          onClick={createRoom}
          style={{
            padding: '1rem',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(10px, 1.8vw, 14px)',
            background: '#ff00ff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 20px #ff00ff',
            letterSpacing: '0.1em',
          }}
        >
          CREAR SALA
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
            onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
            placeholder="CÓDIGO"
            maxLength={8}
            style={{
              flex: 1,
              padding: '0.8rem',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(10px, 1.8vw, 14px)',
              background: '#111',
              color: '#fff',
              border: '2px solid #444',
              outline: 'none',
              letterSpacing: '0.15em',
              textAlign: 'center',
            }}
          />
          <button
            onClick={joinRoom}
            style={{
              padding: '0.8rem 1rem',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(8px, 1.5vw, 12px)',
              background: '#00ffff',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 16px #00ffff',
            }}
          >
            UNIRSE
          </button>
        </div>
      </div>

      <div style={{ fontSize: '8px', color: '#444', marginTop: '1rem' }}>
        PRIMER JUGADOR EN 3 GOLES GANA
      </div>
    </div>
  );
}
