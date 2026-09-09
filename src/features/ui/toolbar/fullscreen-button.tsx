/**
 * @file fullscreen-button.tsx
 * @description Fullscreen toggle button.
 */

import { useCallback } from 'react';
import { cn } from '@/lib/cn';

interface FullscreenButtonProps {
  /** Additional CSS classes */
  className?: string;
}

export function FullscreenButton({ className }: FullscreenButtonProps) {
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  }, []);

  return (
    <button
      onClick={toggleFullscreen}
      className={cn(
        'px-3 py-2 bg-lcd-dark text-lcd-light font-pixel text-[8px] rounded',
        'hover:bg-lcd-med transition-colors',
        className
      )}
      aria-label="Toggle fullscreen"
    >
      ☐
    </button>
  );
}