/**
 * @file use-engine.ts
 * @description Hook that manages the game engine lifecycle.
 *   Creates the GameLoop, Renderer, Input, Audio, and handles
 *   game loading, frame loop, and state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameLoop, Renderer, Input, Audio, SaveState } from '@/engine';
import { createGame, getAllGames, type GameInfo } from '@/engine/games';
import type { Game, GamePadState, Renderer as RendererType } from '@/engine/api';

interface UseEngineReturn {
  currentGame: Game | null;
  currentGameId: string;
  gameInfo: GameInfo | null;
  isRunning: boolean;
  isPaused: boolean;
  framebuffer: Uint8Array | null;
  fps: number;
  loadGame: (gameId: string) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  handleButtonChange: (button: string, pressed: boolean) => void;
  setVolume: (volume: number) => void;
}

interface GameInfo {
  id: string;
  name: string;
  description: string;
}

/** Initial gamepad state (all buttons released) */
const initialGamepad: GamePadState = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
  start: false,
  select: false,
};

/**
 * Hook that manages the game engine lifecycle.
 * @returns Engine control interface
 */
export function useEngine(): UseEngineReturn {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string>('pong');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [framebuffer, setFramebuffer] = useState<Uint8Array | null>(null);
  const [fps, setFps] = useState(0);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<RendererType | null>(null);
  const inputRef = useRef<Input | null>(null);
  const audioRef = useRef<Audio | null>(null);
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const gamepadRef = useRef<GamePadState>({ ...initialGamepad });

  // Initialize engine on mount
  useEffect(() => {
    // Create canvas for renderer
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 144;
    canvasRef.current = canvas;

    rendererRef.current = new Renderer(canvas);
    inputRef.current = new Input();
    audioRef.current = new Audio();

    // Create game loop
    gameLoopRef.current = new (class extends GameLoop {
      update(deltaTime: number) {
        const game = gameRef.current;
        const input = inputRef.current;
        if (!game || !input) return;

        input.update();
        game.update(input.getState(), deltaTime);
      }

      draw(interpolation: number) {
        const game = gameRef.current;
        const renderer = rendererRef.current;
        if (!game || !renderer) return;

        renderer.clear(0);
        game.draw(renderer);
        
        // Update framebuffer state
        setFramebuffer(renderer.getFramebuffer());
      }
    })();

    // Initialize audio on first user interaction
    const initAudio = () => {
      audioRef.current?.resume();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => {
      gameLoopRef.current?.stop();
      audioRef.current?.dispose();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Attach touch handlers when canvas is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && inputRef.current) {
      // Touch handlers will be attached by UI components
    }
  }, [canvasRef.current]);

  const loadGame = useCallback((gameId: string) => {
    const game = createGame(gameId);
    if (!game) return;

    const info = getAllGames().find(g => g.id === gameId);
    
    gameRef.current = game;
    setCurrentGame(game);
    setCurrentGameId(gameId);
    setGameInfo(info ? { id: gameId, name: info.name, description: info.description } : null);
    
    // Initialize game with engine references
    game.renderer = rendererRef.current!;
    game.input = inputRef.current!;
    game.audio = audioRef.current!;
    game.init();

    setIsRunning(true);
    setIsPaused(false);
    gameLoopRef.current?.start();
  }, []);

  const start = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onStart();
      setIsRunning(true);
      setIsPaused(false);
      gameLoopRef.current?.start();
    }
  }, []);

  const pause = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onPause();
      setIsPaused(true);
      gameLoopRef.current?.stop();
    }
  }, []);

  const resume = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onResume();
      setIsPaused(false);
      gameLoopRef.current?.start();
    }
  }, []);

  const reset = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onReset();
      gameRef.current.init();
      setFramebuffer(null);
    }
    setIsRunning(true);
    setIsPaused(false);
    gameLoopRef.current?.start();
  }, []);

  const handleButtonChange = useCallback(
    (button: string, pressed: boolean) => {
      const key = button as keyof GamePadState;
      gamepadRef.current = { ...gamepadRef.current, [key]: pressed };
      inputRef.current?.setButton(key, pressed);
    },
    []
  );

  const setVolume = useCallback((volume: number) => {
    audioRef.current?.setMasterVolume(volume);
  }, []);

  // FPS calculation
  useEffect(() => {
    let frameId: number;
    const tick = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return {
    currentGame: gameRef.current,
    currentGameId,
    gameInfo,
    isRunning,
    isPaused,
    framebuffer,
    fps,
    loadGame,
    start,
    pause,
    resume,
    reset,
    handleButtonChange,
    setVolume,
  };
}

