/**
 * @file screen-bezel.tsx
 * @description Dark border frame around the GameBoy LCD screen.
 *   Provides the inset shadow effect of the DMG screen housing.
 */

import { cn } from '@/lib/cn';

interface ScreenBezelProps {
  /** Child elements (the canvas) rendered inside the bezel */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function ScreenBezel({ children, className }: ScreenBezelProps) {
  return (
    <div
      data-testid="screen-bezel"
      className={cn(
        'relative bg-bezel rounded-lg p-3',
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {children}
    </div>
  );
}