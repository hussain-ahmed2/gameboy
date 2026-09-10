/**
 * @file action-button.tsx
 * @description Single GameBoy action button (A or B).
 *   Circular maroon button with press feedback.
 *   Prevents double-firing on touch devices.
 */

import { useCallback, useRef } from 'react';
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
  const touchActive = useRef(false);

  const handlePress = useCallback(() => {
    onButtonChange(label, true);
  }, [label, onButtonChange]);

  const handleRelease = useCallback(() => {
    onButtonChange(label, false);
  }, [label, onButtonChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchActive.current = true;
    handlePress();
  }, [handlePress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchActive.current = false;
    handleRelease();
  }, [handleRelease]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (touchActive.current) return;
    e.preventDefault();
    handlePress();
  }, [handlePress]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (touchActive.current) return;
    e.preventDefault();
    handleRelease();
  }, [handleRelease]);

  const handleMouseLeave = useCallback(() => {
    if (touchActive.current) return;
    handleRelease();
  }, [handleRelease]);

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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={`${label} button`}
    >
      {label}
    </button>
  );
}
