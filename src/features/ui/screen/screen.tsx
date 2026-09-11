/**
 * @file screen.tsx
 * @description Main GameBoy LCD screen component.
 *   Renders a 160x144 canvas scaled to fill the bezel, with scanline overlay.
 *   Uses a requestAnimationFrame loop to continuously render the framebuffer.
 */

'use client';

import { useRef, useEffect } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT, type DisplayMode } from '@/lib/constants';
import { renderFramebuffer } from './canvas-renderer';
import { ScanlineOverlay } from './scanline-overlay';
import { ScreenBezel } from './screen-bezel';
import { cn } from '@/lib/cn';

interface ScreenProps {
  /** 160x144 framebuffer to render (color indices 0-3) */
  framebuffer: Uint8Array | null;
  /** Whether to show the canvas (always true now, state machine handles content) */
  gameLoaded: boolean;
  /** Active display profile (dmg, pocket, light) */
  displayMode?: DisplayMode;
  /** Additional CSS classes */
  className?: string;
}

export function Screen({ framebuffer, displayMode = 'dmg', className }: ScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fbRef = useRef(framebuffer);
  const modeRef = useRef(displayMode);

  useEffect(() => {
    fbRef.current = framebuffer;
    modeRef.current = displayMode;
  }, [framebuffer, displayMode]);

  useEffect(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      const fb = fbRef.current;
      if (canvas && fb) {
        const ctx = canvas.getContext('2d');
        if (ctx) renderFramebuffer(ctx, fb, modeRef.current);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <ScreenBezel>
      <div className={cn('relative w-full h-full', className)}>
        <canvas
          ref={canvasRef}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          className="block w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
        <ScanlineOverlay />
      </div>
    </ScreenBezel>
  );
}
