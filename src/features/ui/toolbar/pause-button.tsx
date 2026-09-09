/**
 * @file pause-button.tsx
 * @description Pause/resume toggle button with fun styling.
 */

import { cn } from '@/lib/cn';

interface PauseButtonProps {
  /** Whether the emulator is currently paused */
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
        'flex items-center gap-1.5 px-4 py-2 rounded-full',
        'font-pixel text-[8px]',
        'transition-all duration-200',
        'active:scale-95',
        'select-none cursor-pointer',
        isPaused
          ? 'bg-led text-white shadow-[0_0_12px_rgba(72,187,120,0.4)] hover:bg-led/80'
          : 'bg-shell-dark text-white/80 hover:bg-shell-dark/80 hover:text-white',
        className
      )}
      aria-label={isPaused ? 'Resume game' : 'Pause game'}
    >
      <span className="text-sm" role="img" aria-hidden="true">
        {isPaused ? '\u{25B6}' : '\u{23F8}'}
      </span>
      {isPaused ? 'Resume' : 'Pause'}
    </button>
  );
}
