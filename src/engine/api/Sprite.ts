/**
 * @file Sprite.ts
 * @description Animated sprite with position, velocity, and frame animation.
 */

import type { SpriteFrame, Renderer, ColorIndex } from '@/lib/types';

export class Sprite {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  frames: SpriteFrame[] = [];
  currentFrame: number = 0;
  frameTimer: number = 0;
  flipX: boolean = false;
  flipY: boolean = false;
  colorIndex: ColorIndex = 3;
  visible: boolean = true;
  width: number = 8;
  height: number = 8;

  constructor(config: { x: number; y: number; frames: SpriteFrame[] }) {
    this.x = config.x;
    this.y = config.y;
    this.frames = config.frames;
  }

  /** Update sprite animation and position */
  update(deltaTime: number): void {
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Update animation
    if (this.frames.length > 1) {
      this.frameTimer += deltaTime * 1000; // Convert to ms
      const currentFrameData = this.frames[this.currentFrame];
      if (this.frameTimer >= currentFrameData.duration) {
        this.frameTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      }
    }
  }

  /** Draw sprite to renderer */
  draw(renderer: Renderer): void {
    if (!this.visible) return;

    const frame = this.frames[this.currentFrame];
    if (!frame) return;

    // Draw as rectangle (placeholder for tileset rendering)
    renderer.drawRect(this.x, this.y, frame.w, frame.h, this.colorIndex);
  }

  /** Set new animation frames */
  setAnimation(frames: SpriteFrame[]): void {
    this.frames = frames;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  /** Get bounding box for collision */
  getBounds(): { x: number; y: number; w: number; h: number } {
    const frame = this.frames[this.currentFrame] || { w: this.width, h: this.height };
    return { x: this.x, y: this.y, w: frame.w, h: frame.h };
  }

  /** Check collision with another sprite */
  collidesWith(other: Sprite): boolean {
    const a = this.getBounds();
    const b = other.getBounds();
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
}