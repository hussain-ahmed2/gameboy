/**
 * @file action-button.tsx
 * @description Single GameBoy action button (A or B).
 *   Circular maroon button with press feedback.
 */

import { useCallback } from 'react';
import type { GameBoyButton } from '@/lib/types';
import { cn } from '@/lib/cn';

interface ActionButtonProps {
  /** Button label (A or B) */
  label: GameBoyButton;
  /** Callback on press state change */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function ActionButton({ label, onButtonChange, className }: ActionButtonProps) {
  const handlePress = useCallback(() => {
    onButtonChange(label, true);
  }, [label, onButtonChange]);

  const handleRelease = useCallback(() => {
    onButtonChange(label, false);
  }, [label, onButtonChange]);

  return (
    <button
      data-testid={`btn-${label.toLowerCase()}`}
      className={cn(
        'w-14 h-14 rounded-full bg-btn-ab',
        'flex items-center justify-center',
        'font-pixel text-[10px] text-white/80',
        'active:scale-95 active:shadow-inner',
        'transition-transform select-none touch-none',
        className
      )}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      aria-label={`${label} button`}
    >
      {label}
    </button>
  );
}