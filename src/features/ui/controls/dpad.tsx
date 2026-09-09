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
        'relative w-[108px] h-[108px] flex items-center justify-center',
        className
      )}
    >
      {/* Up */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <DPadButton direction="Up" onButtonChange={onButtonChange} />
      </div>

      {/* Down */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <DPadButton direction="Down" onButtonChange={onButtonChange} />
      </div>

      {/* Left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <DPadButton direction="Left" onButtonChange={onButtonChange} />
      </div>

      {/* Right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <DPadButton direction="Right" onButtonChange={onButtonChange} />
      </div>

      {/* Center circle */}
      <div className="w-6 h-6 rounded-full bg-dpad" />
    </div>
  );
}