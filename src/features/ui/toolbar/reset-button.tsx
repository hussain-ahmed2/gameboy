/**
 * @file reset-button.tsx
 * @description Reset button with fun styling.
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
        'flex items-center gap-1.5 px-4 py-2 rounded-full',
        'bg-shell-dark text-white/80 font-pixel text-[8px]',
        'transition-all duration-200',
        'hover:bg-shell-dark/80 hover:text-white',
        'active:scale-95',
        'select-none cursor-pointer',
        className
      )}
      aria-label="Reset game"
    >
      <span className="text-sm" role="img" aria-hidden="true">
        {'\u{1F504}'}
      </span>
      Reset
    </button>
  );
}
