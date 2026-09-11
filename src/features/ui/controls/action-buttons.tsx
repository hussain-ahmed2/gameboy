/**
 * @file action-buttons.tsx
 * @description A and B button container. Renders two action buttons
 *   at an angle, matching the DMG layout.
 */

import type { GameBoyButton } from '@/lib/types';
import { ActionButton } from './action-button';
import { cn } from '@/lib/cn';

interface ActionButtonsProps {
  /** Callback on button press/release */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function ActionButtons({ onButtonChange, className }: ActionButtonsProps) {
  return (
    <div
      data-testid="action-buttons"
      className={cn(
        "relative w-[124px] h-[124px] flex items-center justify-center",
        className,
      )}
    >
      {/* Top: X button */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <ActionButton label="A" displayLabel="X" onButtonChange={onButtonChange} />
      </div>

      {/* Left: Y button */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <ActionButton label="B" displayLabel="Y" onButtonChange={onButtonChange} />
      </div>

      {/* Right: A button (Primary) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <ActionButton label="A" displayLabel="A" onButtonChange={onButtonChange} />
      </div>

      {/* Bottom: B button (Secondary) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <ActionButton label="B" displayLabel="B" onButtonChange={onButtonChange} />
      </div>
    </div>
  );
}