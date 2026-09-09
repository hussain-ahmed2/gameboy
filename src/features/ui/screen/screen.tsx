/**
 * @file screen.tsx
 * @description Main GameBoy LCD screen component.
 *   Renders a 160x144 canvas scaled up with CSS, with scanline overlay
 *   and bezel frame. Accepts a framebuffer to render each frame.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@/lib/constants';
import { renderFramebuffer } from './canvas-renderer';
import { ScanlineOverlay } from './scanline-overlay';
import { ScreenBezel } from './screen-bezel';
import { BootScreen } from './boot-screen';
import { cn } from '@/lib/cn';

interface ScreenProps {
  /** 160x144 framebuffer to render (color indices 0-3) */
  framebuffer: Uint8Array | null;
  /** Whether a game is loaded */
  gameLoaded: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Screen({ framebuffer, gameLoaded, className }: ScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !framebuffer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderFramebuffer(ctx, framebuffer);
  }, [framebuffer]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <ScreenBezel>
      <div className={cn('relative', className)}>
        {gameLoaded ? (
          <canvas
            ref={canvasRef}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            className="block w-[160px] h-[144px] image-rendering-pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <BootScreen />
        )}
        <ScanlineOverlay />
      </div>
    </ScreenBezel>
  );
}