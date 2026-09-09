/**
 * @file use-touch.ts
 * @description Hook that provides touch event handlers for GameBoy buttons.
 *   Prevents default scroll/zoom behavior on touch elements.
 */

import { useCallback, useRef } from 'react';
import type { GameBoyButton } from '@/lib/types';

/**
 * Hook that returns touch event handlers for a GameBoy button.
 * @param button - The GameBoy button this touch handler is for
 * @param onButtonChange - Callback when button state changes
 * @returns Object with touchStart and touchEnd handlers
 */
export function useTouch(
  button: GameBoyButton,
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void
) {
  const callbackRef = useRef(onButtonChange);
  callbackRef.current = onButtonChange;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      callbackRef.current(button, true);
    },
    [button]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      callbackRef.current(button, false);
    },
    [button]
  );

  return { handleTouchStart, handleTouchEnd };
}