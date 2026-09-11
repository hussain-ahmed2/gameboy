/**
 * @file use-keyboard.ts
 * @description Hook that maps keyboard events to GameBoy button states.
 *   Uses KEY_MAP from constants to translate key names.
 */

import { useEffect, useCallback, useRef } from 'react';
import type { GameBoyButton } from '@/lib/types';
import { KEY_MAP } from '@/lib/constants';

/**
 * Hook that listens for keyboard events and dispatches GameBoy button states.
 * @param onButtonChange - Callback when a button state changes
 */
export function useKeyboard(
  onButtonChange: (button: GameBoyButton, pressed: boolean) => void
) {
  const callbackRef = useRef(onButtonChange);
  useEffect(() => {
    callbackRef.current = onButtonChange;
  }, [onButtonChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const button = KEY_MAP[e.key];
    if (button) {
      e.preventDefault();
      callbackRef.current(button, true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const button = KEY_MAP[e.key];
    if (button) {
      e.preventDefault();
      callbackRef.current(button, false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}