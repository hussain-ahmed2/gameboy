/**
 * @file canvas-renderer.ts
 * @description Canvas 2D rendering logic for the GameBoy screen.
 *   Draws framebuffer to canvas with DMG palette.
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, DMG_PALETTE } from '@/lib/constants';

/**
 * Render the framebuffer to a canvas context.
 * @param ctx - Canvas 2D rendering context
 * @param framebuffer - 160x144 Uint8Array with color indices 0-3
 */
export function renderFramebuffer(
  ctx: CanvasRenderingContext2D,
  framebuffer: Uint8Array
): void {
  const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
  const data = imageData.data;

  for (let i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT; i++) {
    const colorIndex = framebuffer[i] & 3;
    const hex = DMG_PALETTE[colorIndex];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const pixelIndex = i * 4;
    data[pixelIndex] = r;
    data[pixelIndex + 1] = g;
    data[pixelIndex + 2] = b;
    data[pixelIndex + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}