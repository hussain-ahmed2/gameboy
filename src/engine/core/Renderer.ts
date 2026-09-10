/**
 * @file Renderer.ts
 * @description Canvas 2D renderer with DMG palette.
 *   Supports 320x288 output with game scale mode (renders at 160x144, scales 2x).
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, DMG_PALETTE, type ColorIndex } from '@/lib/constants';
import type { Sprite, TileMap, SpriteFrame } from '@/lib/types';
import {
  drawText as bmDrawText,
  drawTextCentered as bmDrawTextCentered,
  drawRect as bmDrawRect,
  measureText,
  drawTextSmall as bmDrawTextSmall,
  drawTextCenteredSmall as bmDrawTextCenteredSmall,
  measureTextSmall,
  drawTextMedium as bmDrawTextMedium,
  drawTextCenteredMedium as bmDrawTextCenteredMedium,
  measureTextMedium,
} from './BitmapFont';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private framebuffer: Uint8Array;
  private gameScale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    this.ctx.imageSmoothingEnabled = false;

    this.framebuffer = new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT);
    this.imageData = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /** Set game scale mode (1 = menu/UI mode, 2 = game mode at 160x144) */
  setGameScale(scale: number): void {
    this.gameScale = scale;
  }

  /** Get current game scale */
  getGameScale(): number {
    return this.gameScale;
  }

  /** Scale a coordinate from game space to screen space */
  private sx(x: number): number {
    return this.gameScale === 2 ? x * 2 : x;
  }

  /** Scale a dimension from game space to screen space */
  private sw(w: number): number {
    return this.gameScale === 2 ? w * 2 : w;
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

    this.drawSpriteToFramebuffer(sprite, frame);
  }

  /** Draw sprite to internal framebuffer */
  private drawSpriteToFramebuffer(sprite: Sprite, frame: SpriteFrame): void {
    const sw = frame.w;
    const sh = frame.h;
    const startX = Math.max(0, Math.floor(this.sx(sprite.x)));
    const startY = Math.max(0, Math.floor(this.sx(sprite.y)));
    const endX = Math.min(SCREEN_WIDTH, startX + this.sw(sw));
    const endY = Math.min(SCREEN_HEIGHT, startY + this.sw(sh));

    for (let y = startY; y < endY; y++) {
      const base = y * SCREEN_WIDTH;
      for (let x = startX; x < endX; x++) {
        this.framebuffer[base + x] = sprite.colorIndex;
      }
    }
  }

  /** Draw a tilemap to the screen */
  drawTileMap(tileMap: TileMap): void {
    for (let ty = 0; ty < tileMap.height; ty++) {
      for (let tx = 0; tx < tileMap.width; tx++) {
        const tile = tileMap.tiles[ty]?.[tx];
        if (!tile || tile.index === 0) continue;

        const x = this.sx(tx * tileMap.tileSize);
        const y = this.sx(ty * tileMap.tileSize);
        const colorIndex = tile.colorIndex ?? 3;
        const scaledTileSize = this.sw(tileMap.tileSize);

        for (let py = 0; py < scaledTileSize; py++) {
          const fy = y + py;
          if (fy >= SCREEN_HEIGHT) break;
          const base = fy * SCREEN_WIDTH;
          for (let px = 0; px < scaledTileSize; px++) {
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
    bmDrawRect(this.framebuffer, this.sx(x), this.sx(y), this.sw(w), this.sw(h), colorIndex);
  }

  /** Draw text using bitmap font */
  drawText(text: string, x: number, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawText(this.framebuffer, text.toUpperCase(), this.sx(x), this.sx(y), colorIndex);
  }

  /** Draw centered text using bitmap font */
  drawTextCentered(text: string, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawTextCentered(this.framebuffer, text.toUpperCase(), this.sx(y), colorIndex);
  }

  /** Measure text width in pixels */
  measureText(text: string): number {
    return measureText(text) * this.gameScale;
  }

  /** Draw small (4x4) text */
  drawTextSmall(text: string, x: number, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawTextSmall(this.framebuffer, text.toUpperCase(), this.sx(x), this.sx(y), colorIndex);
  }

  /** Draw centered small (4x4) text */
  drawTextCenteredSmall(text: string, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawTextCenteredSmall(this.framebuffer, text.toUpperCase(), this.sx(y), colorIndex);
  }

  /** Measure small text width in pixels */
  measureTextSmall(text: string): number {
    return measureTextSmall(text) * this.gameScale;
  }

  /** Draw medium (6x6) text */
  drawTextMedium(text: string, x: number, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawTextMedium(this.framebuffer, text.toUpperCase(), this.sx(x), this.sx(y), colorIndex);
  }

  /** Draw centered medium (6x6) text */
  drawTextCenteredMedium(text: string, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawTextCenteredMedium(this.framebuffer, text.toUpperCase(), this.sx(y), colorIndex);
  }

  /** Measure medium text width in pixels */
  measureTextMedium(text: string): number {
    return measureTextMedium(text) * this.gameScale;
  }

  /** Draw a horizontal line */
  drawLine(x: number, y: number, length: number, colorIndex: ColorIndex): void {
    bmDrawRect(this.framebuffer, this.sx(x), this.sx(y), this.sw(length), 1, colorIndex);
  }

  /** Draw a selection arrow */
  drawArrow(x: number, y: number, colorIndex: ColorIndex = 3): void {
    bmDrawRect(this.framebuffer, this.sx(x), this.sx(y + 1), this.sw(3), 1, colorIndex);
    bmDrawRect(this.framebuffer, this.sx(x + 1), this.sx(y), this.sw(3), 1, colorIndex);
    bmDrawRect(this.framebuffer, this.sx(x + 1), this.sx(y + 2), this.sw(3), 1, colorIndex);
  }

  /** Get the current framebuffer */
  getFramebuffer(): Uint8Array {
    return this.framebuffer;
  }

  /** Get canvas element */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** Flush framebuffer to canvas */
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
