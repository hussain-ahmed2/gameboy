/**
 * @file fullscreen-button.tsx
 * @description Fullscreen toggle button with fun styling.
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
        'flex items-center gap-1.5 px-3 py-2 rounded-full',
        'bg-shell-dark text-white/80 font-pixel text-[8px]',
        'transition-all duration-200',
        'hover:bg-shell-dark/80 hover:text-white',
        'active:scale-95',
        'select-none cursor-pointer',
        className
      )}
      aria-label="Toggle fullscreen"
    >
      <span className="text-sm" role="img" aria-hidden="true">
        {'\u{26F6}'}
      </span>
      Full
    </button>
  );
}
