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
  /** Display label (Y, X, B, A) */
  displayLabel?: string;
  /** Callback on press state change */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function ActionButton({ label, displayLabel, onButtonChange, className }: ActionButtonProps) {
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
    <div
      title={`${displayLabel || label} Button`}
      className={cn(
        "relative w-11 h-11 rounded-full flex items-center justify-center",
        // Recessed shadow well in the shell
        "bg-shell-well shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_var(--shell-well-rim)]",
        className,
      )}
    >
      <button
        data-testid={`btn-${(displayLabel || label).toLowerCase()}`}
        tabIndex={-1}
        className={cn(
          "w-10 h-10 rounded-full bg-btn-ab",
          "hover:brightness-110 active:brightness-90",
          "active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(0,0,0,0.7)]",
          "flex items-center justify-center",
          // Large, crisp, high-contrast typography easily visible to all eyes
          "font-sans font-bold text-[13px] tracking-wide text-shell-ink",
          "transition-all duration-150 select-none touch-none cursor-pointer group",
        )}
        style={{
          boxShadow: "var(--shell-btn-shadow)",
          textShadow: "var(--shell-ink-shadow)",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`${displayLabel || label} button`}
      >
        <span className="select-none">{displayLabel || label}</span>
      </button>
    </div>
  );
}
