/**
 * @file page.tsx
 * @description Home page that renders the GameBoy game engine UI.
 *   Composes the shell, screen, controls, toolbar, and status components.
 */

'use client';

import { EngineProvider, useEngineContext } from '@/features/store';
import { GameBoyShell } from '@/features/ui/shell';
import { Screen } from '@/features/ui/screen';
import { DPad, ActionButtons, MetaButtons, TouchHandler } from '@/features/ui/controls';
import { Toolbar } from '@/features/ui/toolbar';
import { FPSCounter, GameInfo } from '@/features/ui/status';

function GameBoyContent() {
  const {
    isRunning,
    isPaused,
    framebuffer,
    fps,
    currentGameId,
    handleButtonChange,
    loadGame,
    pause,
    resume,
    reset,
    setVolume,
  } = useEngineContext();

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <h1 className="font-pixel text-[10px] text-shell-dark mb-4 tracking-widest uppercase">
        GameBoy Game Engine
      </h1>

      <GameBoyShell isRunning={isRunning}>
        {/* Screen */}
        <Screen framebuffer={framebuffer} gameLoaded={isRunning} />

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

      {/* Toolbar */}
      <Toolbar
        currentGame={currentGameId}
        onGameChange={loadGame}
        onPause={isPaused ? resume : pause}
        onReset={reset}
        onVolumeChange={setVolume}
        isPaused={isPaused}
        volume={0.5}
      />

      {/* Status bar */}
      <div className="mt-3 flex items-center gap-4">
        <GameInfo gameId={currentGameId} />
        {isRunning && <FPSCounter fps={fps} />}
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