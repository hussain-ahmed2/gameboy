/**
 * @file page.tsx
 * @description Home page that renders the GameBoy game engine UI.
 *   Composes the shell, screen, controls, and status components.
 */

'use client';

import { useEffect } from 'react';
import { EngineProvider, useEngineContext } from '@/features/store';
import { GameBoyShell } from '@/features/ui/shell';
import { Screen } from '@/features/ui/screen';
import { DPad, ActionButtons, MetaButtons, TouchHandler } from '@/features/ui/controls';
import { EngineState } from '@/engine/core/EngineStateMachine';

function GameBoyContent() {
  const {
    isRunning,
    isPaused,
    framebuffer,
    engineState,
    handleButtonChange,
    pause,
    resume,
  } = useEngineContext();

  // Keyboard shortcuts for meta buttons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape = Pause/Resume toggle
      if (e.key === 'Escape') {
        if (engineState === EngineState.PLAYING) {
          pause();
        } else if (engineState === EngineState.PAUSED) {
          resume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engineState, pause, resume]);

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <h1 className="font-pixel text-[10px] text-shell-dark mb-4 tracking-widest uppercase">
        GameBoy Game Engine
      </h1>

      <GameBoyShell isRunning={isRunning}>
        {/* Screen - always shows framebuffer (state machine handles what to draw) */}
        <Screen framebuffer={framebuffer} gameLoaded={true} />

        {/* Controls */}
        <TouchHandler className="mt-4">
          <div className="flex items-center justify-between px-2">
            <DPad onButtonChange={handleButtonChange} />
            <ActionButtons onButtonChange={handleButtonChange} />
          </div>
          <div className="mt-2 flex justify-center">
            <MetaButtons onButtonChange={handleButtonChange} />
          </div>
        </TouchHandler>
      </GameBoyShell>

      <footer className="mt-4">
        <p className="font-pixel text-[6px] text-shell-dark/40">
          Made by{' '}
          <a
            href="https://github.com/hussain-ahmed2"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-shell-dark/70 transition-colors"
          >
            Hussain Ahmed
          </a>
        </p>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <EngineProvider>
      <GameBoyContent />
    </EngineProvider>
  );
}
