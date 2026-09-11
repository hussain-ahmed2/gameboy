/**
 * @file page.tsx
 * @description Home page that renders the GameBoy game engine UI.
 *   Composes the shell, screen, controls, and status components.
 */

'use client';

import { useState, useEffect } from 'react';
import { EngineProvider, useEngineContext } from '@/features/store';
import { GameBoyShell } from '@/features/ui/shell';
import { Screen } from '@/features/ui/screen';
import { DPad, ActionButtons, MetaButtons, TouchHandler } from '@/features/ui/controls';

function GameBoyContent() {
  const [shellEdition, setShellEdition] = useState<'noir' | 'kiwi' | 'white'>('noir');
  const {
    isRunning,
    isPaused,
    framebuffer,
    displayMode,
    cycleDisplayMode,
    togglePause,
    handleButtonChange,
  } = useEngineContext();

  // Keyboard shortcuts for meta buttons and quick system controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape or 'p' = Pause/Resume toggle (System Sleep)
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
      }
      // 'm' or 'M' = Cycle display mode (DMG, Pocket, Light)
      if (e.key === 'm' || e.key === 'M') {
        cycleDisplayMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause, cycleDisplayMode]);

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 selection:bg-white/10">
      {/* Top Console Custom Architecture Brand & Controls Bar */}
      <div className="w-[400px] max-w-full flex items-center justify-between mb-3 px-1">
        {/* User's Custom Branding & GitHub Profile Link */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <h1 className="font-sans font-bold text-[11px] text-white/95 tracking-[0.22em] uppercase">
            HA POCKET
          </h1>

          {/* GitHub Profile Badge */}
          <a
            href="https://github.com/hussain-ahmed2"
            target="_blank"
            rel="noopener noreferrer"
            title="View Hussain Ahmed on GitHub"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/50 hover:text-white transition-all cursor-pointer group"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="font-sans text-[9px] tracking-wide font-semibold">
              hussain-ahmed2
            </span>
          </a>
        </div>

        {/* System Controls: Shell Edition & Display Palette Badges */}
        <div className="flex items-center gap-2">
          {/* Shell Edition Color Selector (Noir / Kiwi / White matching reference photos) */}
          <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
            <button
              onClick={() => setShellEdition('noir')}
              title="Noir Black Edition"
              aria-label="Noir Black Edition"
              className={`w-4 h-4 rounded-full bg-[#161619] border transition-all ${
                shellEdition === 'noir' ? 'border-emerald-400 scale-110 shadow-sm' : 'border-white/20 opacity-60'
              }`}
            />
            <button
              onClick={() => setShellEdition('kiwi')}
              title="Kiwi Green Edition (Photo 1)"
              aria-label="Kiwi Green Edition"
              className={`w-4 h-4 rounded-full bg-[#7ee647] border transition-all ml-1 ${
                shellEdition === 'kiwi' ? 'border-white scale-110 shadow-sm' : 'border-white/20 opacity-60'
              }`}
            />
            <button
              onClick={() => setShellEdition('white')}
              title="Pure White Edition (Photo 3)"
              aria-label="Pure White Edition"
              className={`w-4 h-4 rounded-full bg-[#f0f2f5] border transition-all ml-1 ${
                shellEdition === 'white' ? 'border-emerald-400 scale-110 shadow-sm' : 'border-white/20 opacity-60'
              }`}
            />
          </div>

          {/* High-Visibility Display Palette Selector */}
          <button
            onClick={cycleDisplayMode}
            title="Click or press 'M' to cycle display palette"
            className="font-sans font-bold text-[9px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white/90 hover:text-white transition-all select-none touch-none cursor-pointer"
          >
            {displayMode === 'dmg'
              ? 'DMG GREEN'
              : displayMode === 'pocket'
              ? 'POCKET B&W'
              : 'LIGHT TEAL'}
          </button>
        </div>
      </div>

      <GameBoyShell
        edition={shellEdition}
        isRunning={isRunning}
        isPaused={isPaused}
      >
        {/* Screen - renders 160x144 framebuffer with active display filter */}
        <Screen
          framebuffer={framebuffer}
          gameLoaded={true}
          displayMode={displayMode}
        />

        {/* Controls Section with Generous Spacing and Visible Typography */}
        <TouchHandler className="mt-6">
          <div className="flex items-center justify-between px-3">
            <DPad onButtonChange={handleButtonChange} />
            <ActionButtons onButtonChange={handleButtonChange} />
          </div>
          <div className="mt-5 flex justify-center">
            <MetaButtons
              onButtonChange={handleButtonChange}
              onHomePress={togglePause}
              isPaused={isPaused}
            />
          </div>
        </TouchHandler>
      </GameBoyShell>

      {/* High-Visibility User Key Guide for Older Players */}
      <footer className="mt-6 flex flex-wrap items-center justify-center gap-3 text-white/50 select-none">
        <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">
          START / ESC: PAUSE
        </span>
        <span>•</span>
        <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">
          P: SLEEP
        </span>
        <span>•</span>
        <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">
          M: PALETTE
        </span>
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
