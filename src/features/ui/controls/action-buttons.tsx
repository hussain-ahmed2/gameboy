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
        'flex gap-3 items-end',
        'rotate-[-20deg]',
        className
      )}
    >
      <ActionButton label="B" onButtonChange={onButtonChange} />
      <ActionButton label="A" onButtonChange={onButtonChange} />
    </div>
  );
}