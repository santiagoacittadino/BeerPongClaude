import { useEffect, useRef, useState } from 'react';
import { socket, connect, joinRoom, sendInput, sendRematchVote } from '../socket/socketClient';
import { EVENTS, GameState, GameStats, PlayerInput, PlayerSide } from '@shared/types';
import { audioManager } from '../audio/audioManager';

export interface UseGameStateResult {
  gameState: GameState | null;
  gameStats: GameStats | null;
  myRole: PlayerSide | null;
  roomId: string | null;
  roomFull: boolean;
  disconnected: boolean;
  enterRoom: (id: string) => void;
  castRematchVote: () => void;
}

export function useGameState(): UseGameStateResult {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [myRole, setMyRole] = useState<PlayerSide | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomFull, setRoomFull] = useState(false);
  const [disconnected, setDisconnected] = useState(false);

  // Input state managed in a ref so the keydown/keyup listeners are stable
  const inputRef = useRef<PlayerInput>({ up: false, down: false });
  const myRoleRef = useRef<PlayerSide | null>(null);

  useEffect(() => {
    myRoleRef.current = myRole;
  }, [myRole]);

  useEffect(() => {
    connect();

    socket.on(EVENTS.ROOM_JOINED, (data: { roomId: string; myRole: PlayerSide }) => {
      setRoomId(data.roomId);
      setMyRole(data.myRole);
      setDisconnected(false);
    });

    socket.on(EVENTS.ROOM_FULL, () => setRoomFull(true));

    socket.on(EVENTS.GAME_STATE, (state: GameState) => {
      setGameState(state);
    });

    socket.on(EVENTS.GOAL_SCORED, ({ scorer, state }: { scorer: PlayerSide; state: GameState }) => {
      setGameState(state);
      if (scorer === 'p1') {
        audioManager.play('goal-p1');
      } else {
        audioManager.play('goal-p2');
      }
    });

    socket.on(EVENTS.GAME_OVER, ({ stats, state }: { stats: GameStats; state: GameState }) => {
      setGameState(state);
      setGameStats(stats);
      audioManager.playVictory();
    });

    socket.on(EVENTS.PLAYER_DISCONNECTED, () => {
      setDisconnected(true);
    });

    return () => {
      socket.off(EVENTS.ROOM_JOINED);
      socket.off(EVENTS.ROOM_FULL);
      socket.off(EVENTS.GAME_STATE);
      socket.off(EVENTS.GOAL_SCORED);
      socket.off(EVENTS.GAME_OVER);
      socket.off(EVENTS.PLAYER_DISCONNECTED);
    };
  }, []);

  // Keyboard input
  useEffect(() => {
    const P1_KEYS: Record<string, keyof PlayerInput> = { w: 'up', W: 'up', s: 'down', S: 'down' };
    const P2_KEYS: Record<string, keyof PlayerInput> = { ArrowUp: 'up', ArrowDown: 'down' };

    function getKeys(): Record<string, keyof PlayerInput> {
      return myRoleRef.current === 'p1' ? P1_KEYS : P2_KEYS;
    }

    function onKeyDown(e: KeyboardEvent) {
      const keys = getKeys();
      const dir = keys[e.key];
      if (!dir || inputRef.current[dir]) return;
      e.preventDefault();
      inputRef.current = { ...inputRef.current, [dir]: true };
      sendInput(inputRef.current);
    }

    function onKeyUp(e: KeyboardEvent) {
      const keys = getKeys();
      const dir = keys[e.key];
      if (!dir) return;
      inputRef.current = { ...inputRef.current, [dir]: false };
      sendInput(inputRef.current);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const enterRoom = (id: string) => {
    setRoomFull(false);
    setDisconnected(false);
    setGameStats(null);
    joinRoom(id);
  };

  const castRematchVote = () => {
    sendRematchVote();
    // Optimistically mark our vote in local state
    if (gameState && myRole) {
      setGameState((prev) =>
        prev ? { ...prev, rematchVotes: { ...prev.rematchVotes, [myRole]: true } } : prev,
      );
    }
  };

  return { gameState, gameStats, myRole, roomId, roomFull, disconnected, enterRoom, castRematchVote };
}
