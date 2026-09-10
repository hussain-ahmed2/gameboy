/**
 * @file screen.tsx
 * @description Main GameBoy LCD screen component.
 *   Renders a 160x144 canvas scaled to fill the bezel, with scanline overlay.
 *   Uses a requestAnimationFrame loop to continuously render the framebuffer.
 */

'use client';

import { useRef, useEffect } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@/lib/constants';
import { renderFramebuffer } from './canvas-renderer';
import { ScanlineOverlay } from './scanline-overlay';
import { ScreenBezel } from './screen-bezel';
import { cn } from '@/lib/cn';

interface ScreenProps {
  /** 160x144 framebuffer to render (color indices 0-3) */
  framebuffer: Uint8Array | null;
  /** Whether to show the canvas (always true now, state machine handles content) */
  gameLoaded: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Screen({ framebuffer, gameLoaded, className }: ScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fbRef = useRef(framebuffer);
  fbRef.current = framebuffer;

  useEffect(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      const fb = fbRef.current;
      if (canvas && fb) {
        const ctx = canvas.getContext('2d');
        if (ctx) renderFramebuffer(ctx, fb);
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
          className="block"
          style={{ imageRendering: 'pixelated', width: '320px', height: '288px' }}
        />
        <ScanlineOverlay />
      </div>
    </ScreenBezel>
  );
}
