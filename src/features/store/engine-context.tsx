/**
 * @file engine-context.tsx
 * @description React Context provider for engine state and actions.
 *   Wraps the app with engine state management via useEngine hook.
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useEngine } from '@/hooks';

type EngineContextType = ReturnType<typeof useEngine>;

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
