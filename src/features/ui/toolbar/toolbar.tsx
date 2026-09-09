/**
 * @file toolbar.tsx
 * @description Toolbar component with game controls: Game Selector,
 *   Pause/Resume, Reset, Volume slider, Fullscreen.
 */

import { getAllGames } from '@/engine/games';
import { GameSelector } from './game-selector';
import { PauseButton } from './pause-button';
import { ResetButton } from './reset-button';
import { VolumeSlider } from './volume-slider';
import { FullscreenButton } from './fullscreen-button';
import { cn } from '@/lib/cn';

interface ToolbarProps {
  /** Current game ID */
  currentGame: string;
  /** Callback when game selection changes */
  onGameChange: (gameId: string) => void;
  /** Callback to toggle pause */
  onPause: () => void;
  /** Callback to reset game */
  onReset: () => void;
  /** Callback when volume changes */
  onVolumeChange: (volume: number) => void;
  /** Whether game is currently paused */
  isPaused: boolean;
  /** Current volume (0-1) */
  volume: number;
  /** Additional CSS classes */
  className?: string;
}

export function Toolbar({
  currentGame,
  onGameChange,
  onPause,
  onReset,
  onVolumeChange,
  isPaused,
  volume,
  className,
}: ToolbarProps) {
  return (
    <div
      data-testid="toolbar"
      className={cn(
        'flex flex-wrap items-center justify-center gap-3 mt-4',
        className
      )}
    >
      <GameSelector currentGame={currentGame} onChange={onGameChange} />
      <PauseButton isPaused={isPaused} onTogglePause={onPause} />
      <ResetButton onReset={onReset} />
      <VolumeSlider volume={volume} onVolumeChange={onVolumeChange} />
      <FullscreenButton />
    </div>
  );
}