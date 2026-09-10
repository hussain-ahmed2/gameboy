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
    fps,
    engineState,
    handleButtonChange,
    pause,
    resume,
  } = useEngineContext();

  // Keyboard shortcuts for meta buttons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape = Pause/Resume
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

      {/* Status bar */}
      <div className="mt-3 flex items-center gap-4">
        <p className="font-pixel text-[8px] text-shell-dark/60">
          {engineState === EngineState.BOOT && 'BOOTING...'}
          {engineState === EngineState.MENU && 'SELECT GAME'}
          {engineState === EngineState.PLAYING && (isPaused ? 'PAUSED' : 'PLAYING')}
          {engineState === EngineState.PAUSED && 'PAUSED'}
          {engineState === EngineState.GAME_OVER && 'GAME OVER'}
        </p>
        {fps > 0 && (
          <p className="font-pixel text-[8px] text-shell-dark/60">
            {fps} FPS
          </p>
        )}
      </div>
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
