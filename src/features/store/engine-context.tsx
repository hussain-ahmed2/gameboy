/**
 * @file engine-context.tsx
 * @description React Context provider for engine state and actions.
 *   Wraps the app with engine state management via useEngine hook.
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useEngine } from '@/hooks';
import type { EngineState, GameOverInfo } from '@/engine/core/EngineStateMachine';

interface EngineContextType {
  currentGameId: string;
  gameInfo: ReturnType<typeof useEngine>['gameInfo'];
  isRunning: boolean;
  isPaused: boolean;
  framebuffer: Uint8Array | null;
  fps: number;
  engineState: EngineState;
  gameOverInfo: GameOverInfo | null;
  loadGame: (gameId: string) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  goToMenu: () => void;
  handleButtonChange: (button: string, pressed: boolean) => void;
  setVolume: (volume: number) => void;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

interface EngineProviderProps {
  children: ReactNode;
}

export function EngineProvider({ children }: EngineProviderProps) {
  const engine = useEngine();

  return (
    <EngineContext.Provider value={engine}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngineContext(): EngineContextType {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngineContext must be used within an EngineProvider');
  }
  return context;
}
