/**
 * @file home-button.tsx
 * @description Dedicated circular Analogue/Home button component.
 *   Provides one-touch system pause, menu access, and sleep/wake.
 */

'use client';

import { useCallback, useRef } from 'react';
import { cn } from '@/lib/cn';

interface HomeButtonProps {
  /** Callback on home button click/tap */
  onPress: () => void;
  /** Whether the engine is currently paused */
  isPaused?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function HomeButton({ onPress, isPaused = false, className }: HomeButtonProps) {
  const touchActive = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      touchActive.current = true;
      onPress();
    },
    [onPress]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touchActive.current = false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (touchActive.current) return;
      e.preventDefault();
      onPress();
    },
    [onPress]
  );

  return (
    <div className="flex flex-col items-center">
      <div
        title="System Menu / Quick Sleep (Escape)"
        className={cn(
          "relative w-9 h-9 rounded-full flex items-center justify-center",
          // Recessed shadow well in the chassis
          "bg-black/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.08)]",
          className,
        )}
      >
        <button
          data-testid="btn-home"
          tabIndex={-1}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="System Menu / Sleep"
          className={cn(
            "w-7 h-7 rounded-full",
            "bg-btn-meta hover:brightness-110 active:brightness-75",
            // Tactile button top sheen and bottom drop shadow
            "shadow-[0_2px_5px_rgba(0,0,0,0.75),inset_0_1.5px_1px_rgba(255,255,255,0.25)]",
            "active:scale-95 active:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.8)]",
            "transition-all duration-150 select-none touch-none",
            "flex items-center justify-center group cursor-pointer",
            isPaused && "ring-1 ring-emerald-400/70 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
          )}
        >
          {/* Precision Debossed Geometric Icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            className={cn(
              "transition-colors duration-150",
              isPaused
                ? "text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]"
                : "text-white/60 group-hover:text-white/90",
            )}
            style={{
              filter: "drop-shadow(0 1px 0 rgba(255, 255, 255, 0.15)) drop-shadow(0 -1px 0.5px rgba(0, 0, 0, 0.7))",
            }}
          >
            {/* Lower-left circle */}
            <circle cx="6.5" cy="17.5" r="3.4" fill="currentColor" />
            {/* Slanted stadium/capsule leaned at ~38 degrees */}
            <rect
              x="13.5"
              y="2"
              width="6.6"
              height="15.5"
              rx="3.3"
              transform="rotate(38 16.7 9.5)"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <span className="font-sans font-bold text-[9px] tracking-wider text-white/70 mt-1 uppercase select-none">
        Menu
      </span>
    </div>
  );
}

