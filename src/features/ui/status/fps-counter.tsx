/**
 * @file fps-counter.tsx
 * @description FPS counter display (visible in development).
 */

import { cn } from '@/lib/cn';

interface FPSCounterProps {
  /** Current frames per second */
  fps: number;
  /** Additional CSS classes */
  className?: string;
}

export function FPSCounter({ fps, className }: FPSCounterProps) {
  return (
    <div
      data-testid="fps-counter"
      className={cn(
        'font-mono text-[10px] text-shell-dark',
        className
      )}
    >
      {fps} FPS
    </div>
  );
}