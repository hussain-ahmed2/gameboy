/**
 * @file Renderer.ts
 * @description Canvas 2D renderer with DMG palette.
 *   Handles 160x144 rendering with pixel-perfect scaling.
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, DMG_PALETTE, type ColorIndex } from '@/lib/constants';
import type { Sprite, TileMap, SpriteFrame } from '@/lib/types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private framebuffer: Uint8Array;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    // Set canvas internal resolution
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    // Disable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;

    // Create framebuffer (color indices 0-3)
    this.framebuffer = new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT);
    this.imageData = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /** Clear the entire screen with a color index */
  clear(colorIndex: ColorIndex = 0): void {
    this.framebuffer.fill(colorIndex);
  }

  /** Draw a sprite to the framebuffer */
  drawSprite(sprite: Sprite): void {
    if (!sprite.visible) return;

    const frame = sprite.frames[sprite.currentFrame];
    if (!frame) return;

    const sw = frame.w;
    const sh = frame.h;
    const sx = frame.x;
    const sy = frame.y;

    // For now, draw as a colored rectangle (placeholder for tileset)
    // In a full implementation, this would sample from a tileset image
    const color = DMG_PALETTE[sprite.colorIndex];

    this.ctx.fillStyle = color;
    this.ctx.save();

    if (sprite.flipX || sprite.flipY) {
      this.ctx.translate(sprite.x + sw / 2, sprite.y + sh / 2);
      this.ctx.scale(sprite.flipX ? -1 : 1, sprite.flipY ? -1 : 1);
      this.ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    } else {
      this.ctx.fillRect(sprite.x, sprite.y, sw, sh);
    }

    this.ctx.restore();

    // Also update framebuffer for save states
    this.drawSpriteToFramebuffer(sprite, frame);
  }

  /** Draw sprite to internal framebuffer (for save states) */
  private drawSpriteToFramebuffer(sprite: Sprite, frame: SpriteFrame): void {
    const sw = frame.w;
    const sh = frame.h;
    const startX = Math.max(0, Math.floor(sprite.x));
    const startY = Math.max(0, Math.floor(sprite.y));
    const endX = Math.min(SCREEN_WIDTH, startX + sw);
    const endY = Math.min(SCREEN_HEIGHT, startY + sh);

    for (let y = startY; y < endY; y++) {
      const base = y * SCREEN_WIDTH;
      for (let x = startX; x < endX; x++) {
        this.framebuffer[base + x] = sprite.colorIndex;
      }
    }
  }

  /** Draw a tilemap to the screen */
  drawTileMap(tileMap: TileMap): void {
    // Draw visible tiles
    for (let ty = 0; ty < tileMap.height; ty++) {
      for (let tx = 0; tx < tileMap.width; tx++) {
        const tile = tileMap.tiles[ty]?.[tx];
        if (!tile || tile.index === 0) continue;

        const x = tx * tileMap.tileSize;
        const y = ty * tileMap.tileSize;
        const colorIndex = tile.colorIndex ?? 3;

        this.ctx.fillStyle = DMG_PALETTE[colorIndex];
        this.ctx.fillRect(x, y, tileMap.tileSize, tileMap.tileSize);

        // Update framebuffer
        for (let py = 0; py < tileMap.tileSize; py++) {
          const fy = y + py;
          if (fy >= SCREEN_HEIGHT) break;
          const base = fy * SCREEN_WIDTH;
          for (let px = 0; px < tileMap.tileSize; px++) {
            const fx = x + px;
            if (fx >= SCREEN_WIDTH) break;
            this.framebuffer[base + fx] = colorIndex;
          }
        }
      }
    }
  }

  /** Draw a filled rectangle */
  drawRect(x: number, y: number, w: number, h: number, colorIndex: ColorIndex): void {
    this.ctx.fillStyle = DMG_PALETTE[colorIndex];
    this.ctx.fillRect(x, y, w, h);

    // Update framebuffer
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(SCREEN_WIDTH, startX + Math.ceil(w));
    const endY = Math.min(SCREEN_HEIGHT, startY + Math.ceil(h));

    for (let y = startY; y < endY; y++) {
      const base = y * SCREEN_WIDTH;
      for (let x = startX; x < endX; x++) {
        this.framebuffer[base + x] = colorIndex;
      }
    }
  }

  /** Draw text (simplified - draws as rectangles for now) */
  drawText(text: string, x: number, y: number, colorIndex: ColorIndex, fontSize = 8): void {
    // Simplified: draw each character as a 5x7 pixel block
    const charW = fontSize * 0.6;
    const charH = fontSize;

    for (let i = 0; i < text.length; i++) {
      this.drawRect(x + i * charW, y, charW, charH, colorIndex);
    }
  }

  /** Get the current framebuffer (color indices 0-3) */
  getFramebuffer(): Uint8Array {
    return this.framebuffer;
  }

  /** Get canvas element for UI integration */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** Flush framebuffer to canvas (for save state restoration) */
  flushFramebuffer(): void {
    const data = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    const pixels = data.data;

    for (let i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT; i++) {
      const colorIndex = this.framebuffer[i] & 3;
      const hex = DMG_PALETTE[colorIndex];
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      const idx = i * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = 255;
    }

    this.ctx.putImageData(data, 0, 0);
  }
}