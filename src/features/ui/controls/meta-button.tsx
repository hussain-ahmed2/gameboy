/**
 * @file meta-button.tsx
 * @description Single meta button (Start or Select).
 *   Small pill-shaped grey button at an angle.
 *   Prevents double-firing on touch devices.
 */

import { useCallback, useRef } from 'react';
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
        'px-4 py-1.5 rounded-full bg-btn-meta',
        'font-pixel text-[6px] text-white/70 uppercase',
        'active:scale-95 active:shadow-inner',
        'transition-transform select-none touch-none',
        'rotate-[-25deg]',
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
