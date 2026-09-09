/**
 * @file pause-button.tsx
 * @description Pause/resume toggle button for the game.
 */

import { cn } from '@/lib/cn';

interface PauseButtonProps {
  /** Whether the game is currently paused */
  isPaused: boolean;
  /** Callback to toggle pause state */
  onTogglePause: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function PauseButton({ isPaused, onTogglePause, className }: PauseButtonProps) {
  return (
    <button
      onClick={onTogglePause}
      className={cn(
        'px-4 py-2 font-pixel text-[8px] rounded transition-colors',
        isPaused
          ? 'bg-lcd-med text-lcd-darkest hover:bg-lcd-light'
          : 'bg-shell-dark text-white hover:bg-shell',
        className
      )}
    >
      {isPaused ? 'Resume' : 'Pause'}
    </button>
  );
}