/**
 * @file dpad.tsx
 * @description Cross-shaped directional pad component.
 *   Arranges four DPadButton components in a + layout.
 */

import type { GameBoyButton } from '@/lib/types';
import { DPadButton } from './dpad-button';
import { cn } from '@/lib/cn';

interface DPadProps {
  /** Callback when any direction is pressed/released */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function DPad({ onButtonChange, className }: DPadProps) {
  return (
    <div
      data-testid="dpad"
      className={cn(
        "relative w-[108px] h-[108px] flex items-center justify-center",
        "drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      {/* Precision Cross Inset Well Background */}
      <div className="pointer-events-none absolute w-9 h-full bg-shell-well rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_var(--shell-well-rim)]" />
      <div className="pointer-events-none absolute h-9 w-full bg-shell-well rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_var(--shell-well-rim)]" />

      {/* Up */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <DPadButton direction="Up" onButtonChange={onButtonChange} />
      </div>

      {/* Down */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
        <DPadButton direction="Down" onButtonChange={onButtonChange} />
      </div>

      {/* Left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <DPadButton direction="Left" onButtonChange={onButtonChange} />
      </div>

      {/* Right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <DPadButton direction="Right" onButtonChange={onButtonChange} />
      </div>

      {/* Center Concave Thumb Dish */}
      <div className="pointer-events-none absolute z-20 w-8 h-8 rounded-full bg-dpad shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),inset_0_-1px_1.5px_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-black/25 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.7),0_0.5px_1px_rgba(255,255,255,0.1)]" />
      </div>
    </div>
  );
}