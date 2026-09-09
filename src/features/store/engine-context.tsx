/**
 * @file engine-context.tsx
 * @description React Context provider for engine state and actions.
 *   Wraps the app with engine state management via useEngine hook.
 */

'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEngine } from '@/hooks';

interface EngineContextType {
  currentGame: ReturnType<typeof useEngine>['currentGame'];
  currentGameId: string;
  gameInfo: ReturnType<typeof useEngine>['gameInfo'];
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

const EngineContext = createContext<EngineContextType | undefined>(undefined);

interface EngineProviderProps {
  children: ReactNode;
}

export function EngineProvider({ children }: EngineProviderProps) {
  const engine = useEngine();

  const value: EngineContextType = {
    ...engine,
    handleButtonChange: useCallback((button: string, pressed: boolean) => {
      engine.handleButtonChange(button, pressed);
    }, [engine]),
  };

  return (
    <EngineContext.Provider value={value}>
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