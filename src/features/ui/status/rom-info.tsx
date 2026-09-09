/**
 * @file rom-info.tsx
 * @description Displays the loaded ROM's title.
 */

import { cn } from '@/lib/cn';

interface ROMInfoProps {
  /** ROM title string */
  title: string | null;
  /** Additional CSS classes */
  className?: string;
}

export function ROMInfo({ title, className }: ROMInfoProps) {
  if (!title) return null;

  return (
    <div
      data-testid="rom-info"
      className={cn(
        'font-pixel text-[8px] text-shell-dark text-center',
        className
      )}
    >
      {title}
    </div>
  );
}
