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
        "relative w-[108px] h-[108px] flex items-center justify-center select-none",
        className,
      )}
    >
      {/* Precision Cross Inset Well in Chassis */}
      <div className="pointer-events-none absolute w-[38px] h-full bg-shell-well rounded-[7px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_var(--shell-well-rim)]" />
      <div className="pointer-events-none absolute h-[38px] w-full bg-shell-well rounded-[7px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_var(--shell-well-rim)]" />

      {/* Unified 3D Tactile Cross Foundation (Continuous Molded Plastic) */}
      <div
        className="pointer-events-none absolute w-[34px] h-[100px] rounded-[5px] bg-dpad"
        style={{ boxShadow: "var(--shell-btn-shadow)" }}
      />
      <div
        className="pointer-events-none absolute h-[34px] w-[100px] rounded-[5px] bg-dpad"
        style={{ boxShadow: "var(--shell-btn-shadow)" }}
      />

      {/* Up */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
        <DPadButton direction="Up" onButtonChange={onButtonChange} />
      </div>

      {/* Down */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10">
        <DPadButton direction="Down" onButtonChange={onButtonChange} />
      </div>

      {/* Left */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
        <DPadButton direction="Left" onButtonChange={onButtonChange} />
      </div>

      {/* Right */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
        <DPadButton direction="Right" onButtonChange={onButtonChange} />
      </div>

      {/* Center Concave Thumb Dish with Adaptive Lighting */}
      <div
        className="pointer-events-none absolute z-20 w-8 h-8 rounded-full bg-dpad flex items-center justify-center"
        style={{
          boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.4), inset 0 -1px 1.5px var(--shell-well-rim)",
        }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full bg-shell-well/45"
          style={{
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), 0 0.5px 1px var(--shell-well-rim)",
          }}
        />
      </div>
    </div>
  );
}