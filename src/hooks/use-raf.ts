/**
 * @file use-raf.ts
 * @description Hook that manages a requestAnimationFrame loop.
 *   Provides start/stop controls and handles cleanup.
 */

import { useRef, useEffect } from 'react';

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

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) return;

    lastTimeRef.current = 0;
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      callbackRef.current(deltaTime);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning]);
}