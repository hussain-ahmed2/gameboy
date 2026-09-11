/**
 * @file TileMap.ts
 * @description Tile-based background map with collision detection.
 */

import type { Tile, Renderer } from '@/lib/types';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/constants';

export class TileMap {
  width: number;
  height: number;
  tiles: Tile[][] = [];
  tileSize: number = 8;

  constructor(config: { width: number; height: number; tileSize?: number }) {
    this.width = config.width;
    this.height = config.height;
    this.tileSize = config.tileSize || 8;
    
    // Initialize empty tile grid
    this.tiles = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(null).map(() => ({ index: 0, solid: false }))
    );
  }

  /** Set a tile at grid position */
  setTile(x: number, y: number, tile: Tile): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = tile;
    }
  }

  /** Get tile at grid position */
  getTile(x: number, y: number): Tile | null {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y][x];
    }
    return null;
  }

  /** Check collision with rectangle */
  checkCollision(x: number, y: number, w: number, h: number): boolean {
    const startTx = Math.floor(x / this.tileSize);
    const startTy = Math.floor(y / this.tileSize);
    const endTx = Math.floor((x + w - 1) / this.tileSize);
    const endTy = Math.floor((y + h - 1) / this.tileSize);

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const tile = this.getTile(tx, ty);
        if (tile?.solid) return true;
      }
    }
    return false;
  }

  /** Find first solid tile in a direction from a point */
  findSolidInDirection(
    x: number, 
    y: number, 
    dx: number, 
    dy: number, 
    maxDist: number
  ): { tx: number; ty: number; dist: number } | null {
    for (let d = 1; d <= maxDist; d++) {
      const tx = Math.floor((x + dx * d) / this.tileSize);
      const ty = Math.floor((y + dy * d) / this.tileSize);
      const tile = this.getTile(tx, ty);
      if (tile?.solid) {
        return { tx, ty, dist: d };
      }
    }
    return null;
  }

  /** Draw tilemap to renderer */
  draw(renderer: Renderer, cameraX: number = 0, cameraY: number = 0): void {
    const startTx = Math.max(0, Math.floor(cameraX / this.tileSize));
    const startTy = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endTx = Math.min(this.width - 1, Math.floor((cameraX + GAME_WIDTH) / this.tileSize));
    const endTy = Math.min(this.height - 1, Math.floor((cameraY + GAME_HEIGHT) / this.tileSize));

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const tile = this.tiles[ty]?.[tx];
        if (!tile || tile.index === 0) continue;

        const drawX = tx * this.tileSize - cameraX;
        const drawY = ty * this.tileSize - cameraY;
        const colorIndex = tile.colorIndex ?? 3;

        renderer.drawRect(drawX, drawY, this.tileSize, this.tileSize, colorIndex);
      }
    }
  }

  /** Fill a rectangular area with a tile */
  fillRect(x: number, y: number, w: number, h: number, tile: Tile): void {
    for (let ty = y; ty < y + h; ty++) {
      for (let tx = x; tx < x + w; tx++) {
        this.setTile(tx, ty, tile);
      }
    }
  }
}