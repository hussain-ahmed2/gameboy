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
      tabIndex={-1}
      className={cn(
        "w-9 h-9 bg-dpad",
        "flex items-center justify-center",
        "transition-all duration-150 select-none touch-none cursor-pointer group",
        "hover:brightness-115 active:brightness-90",
        // Tactile depth matching the action buttons
        "shadow-[0_2px_5px_rgba(0,0,0,0.6)]",
        direction === "Up" && "rounded-t-md shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.28),inset_1px_0_1px_rgba(255,255,255,0.12),inset_-1px_0_1px_rgba(0,0,0,0.4)]",
        direction === "Down" && "rounded-b-md shadow-[inset_0_-1.5px_1px_rgba(0,0,0,0.6),inset_1px_0_1px_rgba(255,255,255,0.12),inset_-1px_0_1px_rgba(0,0,0,0.4)]",
        direction === "Left" && "rounded-l-md shadow-[inset_1.5px_0_1px_rgba(255,255,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.4)]",
        direction === "Right" && "rounded-r-md shadow-[inset_-1.5px_0_1px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.4)]",
        className,
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={direction}
    >
      {/* Crisp, high-contrast directional arrow */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-shell-ink group-hover:brightness-110 transition-all duration-150"
        style={{
          filter: "drop-shadow(var(--shell-ink-shadow))",
        }}
      >
        {direction === "Up" && <path d="M12 5l-7 8h14l-7-8z" />}
        {direction === "Down" && <path d="M12 19l7-8H5l7 8z" />}
        {direction === "Left" && <path d="M5 12l8-7v14l-8-7z" />}
        {direction === "Right" && <path d="M19 12l-8-7v14l8-7z" />}
      </svg>
      <span className="sr-only">{direction}</span>
    </button>
  );
}
