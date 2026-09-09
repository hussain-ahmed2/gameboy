/**
 * @file meta-buttons.tsx
 * @description Start and Select button container.
 *   Renders two meta buttons with the DMG angled layout.
 */

import type { GameBoyButton } from '@/lib/types';
import { MetaButton } from './meta-button';
import { cn } from '@/lib/cn';

interface MetaButtonsProps {
  /** Callback on button press/release */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export function MetaButtons({ onButtonChange, className }: MetaButtonsProps) {
  return (
    <div
      data-testid="meta-buttons"
      className={cn(
        'flex gap-4 items-center justify-center',
        className
      )}
    >
      <MetaButton label="Select" onButtonChange={onButtonChange} />
      <MetaButton label="Start" onButtonChange={onButtonChange} />
    </div>
  );
}