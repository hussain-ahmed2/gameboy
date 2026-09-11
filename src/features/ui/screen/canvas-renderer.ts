/**
 * @file canvas-renderer.ts
 * @description Canvas 2D rendering logic for the GameBoy screen.
 *   Draws framebuffer to canvas with DMG palette.
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, DISPLAY_PALETTES_UINT32, type DisplayMode } from '@/lib/constants';

let cachedImageData: ImageData | null = null;
let cachedUint32View: Uint32Array | null = null;

/**
 * Render the framebuffer to a canvas context with zero per-frame garbage collection.
 * Uses 32-bit direct buffer mapping for 60 FPS performance.
 * @param ctx - Canvas 2D rendering context
 * @param framebuffer - 160x144 Uint8Array with color indices 0-3
 * @param displayMode - Analogue display filter (dmg, pocket, light)
 */
export function renderFramebuffer(
  ctx: CanvasRenderingContext2D,
  framebuffer: Uint8Array,
  displayMode: DisplayMode = 'dmg'
): void {
  if (!cachedImageData) {
    cachedImageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    cachedUint32View = new Uint32Array(cachedImageData.data.buffer);
  }

  const palette = DISPLAY_PALETTES_UINT32[displayMode] ?? DISPLAY_PALETTES_UINT32.dmg;
  const pixels = cachedUint32View!;
  const total = SCREEN_WIDTH * SCREEN_HEIGHT;

  for (let i = 0; i < total; i++) {
    pixels[i] = palette[framebuffer[i] & 3];
  }

  ctx.putImageData(cachedImageData, 0, 0);
}