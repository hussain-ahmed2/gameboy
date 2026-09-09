/**
 * @file power-led.tsx
 * @description Red power LED indicator with glow effect.
 *   Solid when game is running.
 */

import { cn } from '@/lib/cn';

interface PowerLEDProps {
  /** Whether the game is running */
  isRunning: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PowerLED({ isRunning, className }: PowerLEDProps) {
  return (
    <div
      data-testid="power-led"
      className={cn(
        'w-2 h-2 rounded-full',
        isRunning
          ? 'bg-led shadow-[0_0_8px_#ff0000]'
          : 'bg-shell-dark',
        className
      )}
    />
  );
}