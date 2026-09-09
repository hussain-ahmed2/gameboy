/**
 * @file reset-button.tsx
 * @description Reset button that restarts the current game.
 */

import { cn } from '@/lib/cn';

interface ResetButtonProps {
  /** Callback to reset the game */
  onReset: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function ResetButton({ onReset, className }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className={cn(
        'px-4 py-2 bg-shell-dark text-white font-pixel text-[8px] rounded',
        'hover:bg-shell transition-colors',
        className
      )}
    >
      Reset
    </button>
  );
}