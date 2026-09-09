/**
 * @file use-raf.ts
 * @description Hook that manages a requestAnimationFrame loop.
 *   Provides start/stop controls and handles cleanup.
 */

import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook that manages a requestAnimationFrame loop.
 * @param callback - Function called on each animation frame with deltaTime
 * @param isRunning - Whether the loop should be active
 */
export function useRaf(
  callback: (deltaTime: number) => void,
  isRunning: boolean
) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  callbackRef.current = callback;

  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = timestamp;

    callbackRef.current(deltaTime);
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, tick]);
}