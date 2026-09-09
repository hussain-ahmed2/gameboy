/**
 * @file meta-button.tsx
 * @description Single meta button (Start or Select).
 *   Small pill-shaped grey button at an angle.
 */

import { useCallback } from 'react';
import type { GameBoyButton } from '@/lib/types';
import { cn } from '@/lib/cn';

interface MetaButtonProps {
  /** Button label (Start or Select) */
  label: GameBoyButton;
  /** Callback on press state change */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function MetaButton({ label, onButtonChange, className }: MetaButtonProps) {
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
        'px-4 py-1.5 rounded-full bg-btn-meta',
        'font-pixel text-[6px] text-white/70 uppercase',
        'active:scale-95 active:shadow-inner',
        'transition-transform select-none touch-none',
        'rotate-[-25deg]',
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