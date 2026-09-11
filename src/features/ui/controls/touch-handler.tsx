/**
 * @file touch-handler.tsx
 * @description Wrapper component that prevents default touch behaviors
 *   (scrolling, zooming) on its children while passing through touch events.
 */

'use client';

import { useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface TouchHandlerProps {
  /** Child elements */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function TouchHandler({ children, className }: TouchHandlerProps) {
  const preventScroll = useCallback((e: React.TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
  }, []);

  return (
    <div
      className={cn('touch-none', className)}
      onTouchMove={preventScroll}
      onTouchStart={preventScroll}
    >
      {children}
    </div>
  );
}