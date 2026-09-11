/**
 * @file use-touch.ts
 * @description Hook that provides touch event handlers for GameBoy buttons.
 *   Prevents default scroll/zoom behavior on touch elements.
 */

import { useCallback, useRef, useEffect } from 'react';
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
  useEffect(() => {
    callbackRef.current = onButtonChange;
  }, [onButtonChange]);

  const handleTouchStart = useCallback(() => {
    callbackRef.current(button, true);
  }, [button]);

  const handleTouchEnd = useCallback(() => {
    callbackRef.current(button, false);
  }, [button]);

  return { handleTouchStart, handleTouchEnd };
}