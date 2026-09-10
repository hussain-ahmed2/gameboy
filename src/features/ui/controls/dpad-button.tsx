/**
 * @file dpad-button.tsx
 * @description Single directional button for the D-pad.
 *   Handles mouse and touch events, dispatching press/release callbacks.
 *   Prevents double-firing on touch devices.
 */

import { useCallback, useRef } from 'react';
import type { GameBoyButton } from '@/lib/types';
import { cn } from '@/lib/cn';

interface DPadButtonProps {
  /** Direction this button represents */
  direction: GameBoyButton;
  /** Callback on press state change */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function DPadButton({ direction, onButtonChange, className }: DPadButtonProps) {
  const touchActive = useRef(false);

  const handlePress = useCallback(() => {
    onButtonChange(direction, true);
  }, [direction, onButtonChange]);

  const handleRelease = useCallback(() => {
    onButtonChange(direction, false);
  }, [direction, onButtonChange]);

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
      data-testid={`dpad-${direction.toLowerCase()}`}
      className={cn(
        'w-9 h-9 bg-dpad rounded-sm',
        'active:bg-dpad/80 active:scale-95',
        'transition-transform select-none touch-none',
        'flex items-center justify-center',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={direction}
    >
      <span className="sr-only">{direction}</span>
    </button>
  );
}
