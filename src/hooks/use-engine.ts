/**
 * @file use-engine.ts
 * @description Hook that manages the game engine lifecycle.
 *   Creates the GameLoop, Renderer, Input, Audio, and handles
 *   game loading, frame loop, and state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameLoop, Renderer, Input, Audio, EngineStateMachine, EngineState } from '@/engine';
import { createGame, getAllGames, type GameInfo } from '@/engine/games';
import { Game } from '@/engine/api/Game';
import type { GamePadState } from '@/lib/types';
import type { GameOverInfo } from '@/engine/core/EngineStateMachine';
import { SCREEN_WIDTH, SCREEN_HEIGHT, type DisplayMode } from '@/lib/constants';

interface UseEngineReturn {
  currentGameId: string;
  gameInfo: GameInfo | null;
  isRunning: boolean;
  isPaused: boolean;
  framebuffer: Uint8Array | null;
  fps: number;
  engineState: EngineState;
  gameOverInfo: GameOverInfo | null;
  displayMode: DisplayMode;
  cycleDisplayMode: () => void;
  setDisplayMode: (mode: DisplayMode) => void;
  togglePause: () => void;
  loadGame: (gameId: string) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToMenu: () => void;
  handleButtonChange: (button: string, pressed: boolean) => void;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => boolean;
  playClick: () => void;
}

const initialGamepad: GamePadState = {
  up: false, down: false, left: false, right: false,
  a: false, b: false, start: false, select: false,
};

export function useEngine(): UseEngineReturn {
  const [currentGameId, setCurrentGameId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [framebuffer, setFramebuffer] = useState<Uint8Array | null>(null);
  const [fps, setFps] = useState(0);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [engineState, setEngineState] = useState<EngineState>(EngineState.BOOT);
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>('dmg');
  const [isMuted, setIsMuted] = useState(false);

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputRef = useRef<Input | null>(null);
  const audioRef = useRef<Audio | null>(null);
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateMachineRef = useRef<EngineStateMachine | null>(null);

  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(0);
  const gamepadRef = useRef<GamePadState>({ ...initialGamepad });

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayModeState(mode);
    rendererRef.current?.setDisplayMode(mode);
  }, []);

  const cycleDisplayMode = useCallback(() => {
    setDisplayModeState((prev) => {
      const next: DisplayMode = prev === 'dmg' ? 'pocket' : prev === 'pocket' ? 'light' : 'dmg';
      rendererRef.current?.setDisplayMode(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvasRef.current = canvas;

    const rendererInstance = new Renderer(canvas);
    rendererRef.current = rendererInstance;
    inputRef.current = new Input();
    audioRef.current = new Audio();

    const games = getAllGames();
    stateMachineRef.current = new EngineStateMachine({
      renderer: rendererInstance,
      input: inputRef.current,
      games,
      currentGameId: '',
      gameOverInfo: null,
      onStateChange: (state) => {
        setEngineState(state);
      },
      onGameSelect: (gameId) => {
        const game = createGame(gameId);
        if (!game) return;

        const info = getAllGames().find(g => g.id === gameId);

        gameRef.current = game;
        setCurrentGameId(gameId);
        setGameInfo(info ?? null);

        game.renderer = rendererInstance;
        game.input = inputRef.current!;
        game.audio = audioRef.current!;
        game.init();
        game.onReset();

        setIsRunning(true);
        setIsPaused(false);

        inputRef.current?.update();
        stateMachineRef.current?.transition(EngineState.PLAYING);
      },
      onGameContinue: (gameId) => {
        const game = createGame(gameId);
        if (!game) return;

        const info = getAllGames().find(g => g.id === gameId);

        gameRef.current = game;
        setCurrentGameId(gameId);
        setGameInfo(info ?? null);

        game.renderer = rendererInstance;
        game.input = inputRef.current!;
        game.audio = audioRef.current!;
        game.init();
        game.loadFromStorage();

        setIsRunning(true);
        setIsPaused(false);

        inputRef.current?.update();
        stateMachineRef.current?.transition(EngineState.PLAYING);
      },
      onGameResume: () => {
        setIsPaused(false);
        inputRef.current?.update();
        stateMachineRef.current?.transition(EngineState.PLAYING);
      },
      onGameRestart: () => {
        if (gameRef.current) {
          gameRef.current.onReset();
          gameRef.current.init();
        }
        setIsPaused(false);
        setGameOverInfo(null);
        inputRef.current?.update();
        stateMachineRef.current?.transition(EngineState.PLAYING);
      },
      onGameMenu: () => {
        setIsRunning(false);
        setIsPaused(false);
        setGameOverInfo(null);
        inputRef.current?.update();
        stateMachineRef.current?.transition(EngineState.MENU);
      },
    });

    gameLoopRef.current = new (class extends GameLoop {
      update(deltaTime: number) {
        const input = inputRef.current;
        const sm = stateMachineRef.current;
        if (!input || !sm) return;

        const prevState = sm.getState();

        sm.update(deltaTime);

        const state = sm.getState();
        if (state === EngineState.PLAYING) {
          // Modern GameBoy / Analogue: START button pauses active gameplay
          // Only pause if the game was ALREADY in PLAYING state before this frame
          // (prevents the Enter/START press used to launch the game from pausing it immediately)
          if (prevState === EngineState.PLAYING && input.isJustPressed('start')) {
            sm.captureGameFrame(rendererInstance.getFramebuffer());
            gameRef.current?.onPause();
            audioRef.current?.boop();
            setIsPaused(true);
            sm.transition(EngineState.PAUSED);
            input.update();
            return;
          }

          rendererInstance.setGameScale(2);
          const game = gameRef.current;
          if (game) {
            game.update(input.getState(), deltaTime);

            if (game.isGameOver()) {
              sm.captureGameFrame(rendererInstance.getFramebuffer());
              const info = game.getGameOverData();
              setGameOverInfo(info);
              sm.transition(EngineState.GAME_OVER);
            }
          }
        } else {
          rendererInstance.setGameScale(1);
        }

        input.update();
      }

      draw(_interpolation: number) {
        const sm = stateMachineRef.current;
        const renderer = rendererRef.current;
        if (!sm || !renderer) return;

        const state = sm.getState();

        if (state === EngineState.PLAYING) {
          renderer.setGameScale(2);
          const game = gameRef.current;
          if (game) {
            renderer.clear(0);
            game.draw(renderer);

            // Credit overlay
            renderer.drawTextCentered('MADE BY HUSSAIN AHMED', SCREEN_HEIGHT - 12, 2);
          }
        } else if (state === EngineState.PAUSED || state === EngineState.GAME_OVER) {
          renderer.setGameScale(1);
          sm.draw(_interpolation);
        } else {
          renderer.setGameScale(1);
          sm.draw(_interpolation);
        }

        setFramebuffer(new Uint8Array(renderer.getFramebuffer()));
      }
    })();

    const initAudio = () => {
      audioRef.current?.resume();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('pointerdown', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    window.addEventListener('pointerdown', initAudio);

    // Auto-sleep when window/tab is blurred or phone screen locked
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const sm = stateMachineRef.current;
        const renderer = rendererRef.current;
        if (sm && renderer && sm.getState() === EngineState.PLAYING) {
          sm.captureGameFrame(renderer.getFramebuffer());
          gameRef.current?.onPause();
          setIsPaused(true);
          sm.transition(EngineState.PAUSED);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    gameLoopRef.current.start();

    return () => {
      gameLoopRef.current?.stop();
      audioRef.current?.dispose();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('pointerdown', initAudio);
    };
  }, []);

  const loadGame = useCallback((gameId: string) => {
    stateMachineRef.current?.onGameSelect(gameId);
  }, []);

  const start = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onStart();
      setIsRunning(true);
      setIsPaused(false);
      stateMachineRef.current?.transition(EngineState.PLAYING);
    }
  }, []);

  const pause = useCallback(() => {
    const sm = stateMachineRef.current;
    const renderer = rendererRef.current;
    if (gameRef.current && sm && renderer && sm.getState() === EngineState.PLAYING) {
      // Capture the current game frame before pausing
      sm.captureGameFrame(renderer.getFramebuffer());
      gameRef.current.onPause();
      setIsPaused(true);
      sm.transition(EngineState.PAUSED);
    }
  }, []);

  const resume = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onResume();
      setIsPaused(false);
      stateMachineRef.current?.transition(EngineState.PLAYING);
    }
  }, []);

  const reset = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.onReset();
      gameRef.current.init();
      setGameOverInfo(null);
    }
    setIsRunning(true);
    setIsPaused(false);
    stateMachineRef.current?.transition(EngineState.PLAYING);
  }, []);

  const goToMenu = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setGameOverInfo(null);
    stateMachineRef.current?.transition(EngineState.MENU);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const muted = audioRef.current.toggleMute();
      setIsMuted(muted);
      return muted;
    }
    return false;
  }, []);

  const playClick = useCallback(() => {
    audioRef.current?.playClick();
  }, []);

  const handleButtonChange = useCallback(
    (button: string, pressed: boolean) => {
      if (pressed) {
        audioRef.current?.playClick();
      }
      const buttonToKey: Record<string, keyof GamePadState> = {
        Up: 'up', Down: 'down', Left: 'left', Right: 'right',
        A: 'a', B: 'b', Start: 'start', Select: 'select',
      };
      const key = buttonToKey[button] ?? button as keyof GamePadState;
      gamepadRef.current = { ...gamepadRef.current, [key]: pressed };
      inputRef.current?.setButton(key, pressed);
    },
    []
  );

  const setVolume = useCallback((volume: number) => {
    audioRef.current?.setMasterVolume(volume);
  }, []);

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

  const togglePause = useCallback(() => {
    const sm = stateMachineRef.current;
    if (!sm) return;
    const state = sm.getState();
    if (state === EngineState.PLAYING) {
      pause();
    } else if (state === EngineState.PAUSED) {
      resume();
    }
  }, [pause, resume]);

  return {
    currentGameId, gameInfo, isRunning, isPaused, framebuffer, fps,
    engineState, gameOverInfo, displayMode, cycleDisplayMode, setDisplayMode,
    togglePause, loadGame, start, pause, resume, reset,
    goToMenu, handleButtonChange, setVolume,
    isMuted, toggleMute, playClick,
  };
}
