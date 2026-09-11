/**
 * @file meta-buttons.tsx
 * @description Start and Select button container.
 *   Renders two meta buttons with the DMG angled layout.
 */

import type { GameBoyButton } from '@/lib/types';
import { MetaButton } from './meta-button';
import { HomeButton } from './home-button';
import { cn } from '@/lib/cn';

interface MetaButtonsProps {
  /** Callback on button press/release */
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void;
  /** Optional home/pause button press callback */
  onHomePress?: () => void;
  /** Whether the system is paused */
  isPaused?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function MetaButtons({
  onButtonChange,
  onHomePress,
  isPaused = false,
  className,
}: MetaButtonsProps) {
  return (
    <div
      data-testid="meta-buttons"
      className={cn(
        "flex gap-6 items-center justify-center pt-2 select-none",
        className,
      )}
    >
      <MetaButton label="Select" onButtonChange={onButtonChange} />
      {onHomePress && (
        <HomeButton onPress={onHomePress} isPaused={isPaused} />
      )}
      <MetaButton label="Start" onButtonChange={onButtonChange} />
    </div>
  );
}