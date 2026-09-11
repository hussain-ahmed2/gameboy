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
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(() => {
    onButtonChange(label, true);
  }, [label, onButtonChange]);

  const handleRelease = useCallback(() => {
    onButtonChange(label, false);
  }, [label, onButtonChange]);

  const handleTouchStart = useCallback(() => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchActive.current = true;
    handlePress();
  }, [handlePress]);

  const handleTouchEnd = useCallback(() => {
    handleRelease();
    // Keep touchActive true for 500ms to absorb synthetic mouse events from browser
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      touchActive.current = false;
    }, 500);
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
    <div className="flex flex-col items-center">
      <div
        title={
          label === 'Select'
            ? 'Select Button (Shift: Navigate Menus / In-Game Palette)'
            : 'Start Button (Enter: Launch / Pause)'
        }
        className={cn(
          "relative w-9 h-9 rounded-full flex items-center justify-center",
          // Recessed shadow well in the chassis
          "bg-shell-well shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_var(--shell-well-rim)]",
          className,
        )}
      >
        <button
          data-testid={`btn-${label.toLowerCase()}`}
          tabIndex={-1}
          className={cn(
            "w-7 h-7 rounded-full",
            "bg-btn-meta hover:brightness-110 active:brightness-75",
            "active:scale-95 active:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.8)]",
            "transition-all duration-150 select-none touch-none",
            "flex items-center justify-center cursor-pointer",
          )}
          style={{
            boxShadow: "var(--shell-btn-shadow)",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`${label} button`}
        />
      </div>
      <span className="font-sans font-bold text-[9px] tracking-wider text-shell-text mt-1 uppercase select-none">
        {label}
      </span>
    </div>
  );
}
