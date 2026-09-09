/**
 * @file PlatformerGame.ts
 * @description Side-scrolling platformer - jump, collect coins, reach flag.
 */

import { Game, Sprite, TileMap } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { Audio } from '@/engine/core';
import { SaveState } from '@/engine/core';

const GRAVITY = 400;
const JUMP_VELOCITY = -180;
const MOVE_SPEED = 60;
const MAX_FALL_SPEED = 200;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.1;

interface Level {
  tiles: number[][]; // 0=empty, 1=solid, 2=coin, 3=flag
  coins: { x: number; y: number }[];
  flag: { x: number; y: number };
  spawnX: number;
  spawnY: number;
}

const LEVELS: Level[] = [
  // Level 1
  {
    tiles: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    coins: [
      { x: 3, y: 10 }, { x: 6, y: 8 }, { x: 10, y: 10 },
      { x: 14, y: 8 }, { x: 17, y: 10 }, { x: 5, y: 6 },
    ],
    flag: { x: 19, y: 11 },
    spawnX: 1,
    spawnY: 11,
  },
  // Level 2
  {
    tiles: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    coins: [
      { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 8, y: 4 }, { x: 10, y: 4 },
      { x: 14, y: 4 }, { x: 16, y: 4 }, { x: 1, y: 9 }, { x: 3, y: 9 },
      { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 13, y: 9 }, { x: 15, y: 9 },
    ],
    flag: { x: 19, y: 11 },
    spawnX: 1,
    spawnY: 11,
  },
];

const TILE_SIZE = 8;

export class PlatformerGame extends Game {
  private player!: Sprite;
  private level!: TileMap;
  private currentLevel = 0;
  private coins = 0;
  private totalCoins = 0;
  private cameraX = 0;
  private onGround = false;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private gameWon = false;
  private levelComplete = false;
  private levelCompleteTimer = 0;

  init(): void {
    this.coins = 0;
    this.currentLevel = 0;
    this.loadLevel(0);
  }

  private loadLevel(levelIndex: number): void {
    const levelData = LEVELS[levelIndex];
    
    // Create tilemap
    this.level = new TileMap({ 
      width: levelData.tiles[0].length, 
      height: levelData.tiles.length,
      tileSize: TILE_SIZE,
    });

    // Fill tiles
    for (let y = 0; y < levelData.tiles.length; y++) {
      for (let x = 0; x < levelData.tiles[y].length; x++) {
        const tileType = levelData.tiles[y][x];
        if (tileType === 1) {
          this.level.setTile(x, y, { index: 1, solid: true, colorIndex: 2 });
        } else if (tileType === 2) {
          this.level.setTile(x, y, { index: 2, solid: false, colorIndex: 3 });
        } else if (tileType === 3) {
          this.level.setTile(x, y, { index: 3, solid: false, colorIndex: 3 });
        }
      }
    }

    // Count coins
    this.totalCoins = levelData.coins.length;

    // Create player
    this.player = new Sprite({
      x: levelData.spawnX * TILE_SIZE,
      y: levelData.spawnY * TILE_SIZE,
      frames: [
        { x: 0, y: 0, w: 8, h: 8, duration: 200 }, // idle
        { x: 8, y: 0, w: 8, h: 8, duration: 100 }, // walk 1
        { x: 16, y: 0, w: 8, h: 8, duration: 100 }, // walk 2
      ],
    });
    this.player.width = 8;
    this.player.height = 8;
    this.player.colorIndex = 3;

    // Place coins as visual indicators
    levelData.coins.forEach(coin => {
      this.level.setTile(coin.x, coin.y, { index: 2, solid: false, colorIndex: 3 });
    });

    // Place flag
    this.level.setTile(levelData.flag.x, levelData.flag.y, { index: 3, solid: false, colorIndex: 3 });

    this.onGround = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.levelComplete = false;
    this.levelCompleteTimer = 0;
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this.gameWon) {
      if (input.start && this.isJustPressed(input, 'start')) {
        this.currentLevel = 0;
        this.coins = 0;
        this.loadLevel(0);
        this.gameWon = false;
      }
      return;
    }

    if (this.levelComplete) {
      this.levelCompleteTimer -= deltaTime;
      if (this.levelCompleteTimer <= 0) {
        this.currentLevel++;
        if (this.currentLevel >= LEVELS.length) {
          this.gameWon = true;
        } else {
          this.loadLevel(this.currentLevel);
        }
      }
      return;
    }

    // Horizontal movement
    let moveX = 0;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    this.player.vx = moveX * MOVE_SPEED;

    // Update animation based on movement
    if (moveX !== 0) {
      this.player.flipX = moveX < 0;
    }

    // Jump buffering
    if (input.a) {
      this.jumpBufferTimer = JUMP_BUFFER;
    } else {
      this.jumpBufferTimer -= deltaTime;
    }

    // Coyote time
    if (this.onGround) {
      this.coyoteTimer = COYOTE_TIME;
    } else {
      this.coyoteTimer -= deltaTime;
    }

    // Jump
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.player.vy = JUMP_VELOCITY;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      Audio.prototype.jump.call(this.audio);
    }

    // Apply gravity
    this.player.vy += GRAVITY * deltaTime;
    if (this.player.vy > MAX_FALL_SPEED) this.player.vy = MAX_FALL_SPEED;

    // Move X
    this.player.x += this.player.vx * deltaTime;
    this.resolveHorizontalCollisions();

    // Move Y
    this.player.y += this.player.vy * deltaTime;
    this.resolveVerticalCollisions();

    // Camera follow
    this.cameraX = Math.max(0, Math.min(
      this.player.x - 80,
      this.level.width * TILE_SIZE - 160
    ));

    // Check coin collection
    this.checkCoins();

    // Check flag
    this.checkFlag();

    // Update player animation
    this.player.update(deltaTime);
  }

  private resolveHorizontalCollisions(): void {
    const nextX = this.player.x;
    const leftTile = Math.floor(nextX / TILE_SIZE);
    const rightTile = Math.floor((nextX + this.player.width - 1) / TILE_SIZE);
    const topTile = Math.floor(this.player.y / TILE_SIZE);
    const bottomTile = Math.floor((this.player.y + this.player.height - 1) / TILE_SIZE);

    if (this.player.vx > 0) {
      // Moving right
      for (let ty = topTile; ty <= bottomTile; ty++) {
        const tile = this.level.getTile(rightTile, ty);
        if (tile?.solid) {
          this.player.x = rightTile * TILE_SIZE - this.player.width;
          this.player.vx = 0;
          break;
        }
      }
    } else if (this.player.vx < 0) {
      // Moving left
      for (let ty = topTile; ty <= bottomTile; ty++) {
        const tile = this.level.getTile(leftTile, ty);
        if (tile?.solid) {
          this.player.x = (leftTile + 1) * TILE_SIZE;
          this.player.vx = 0;
          break;
        }
      }
    }
  }

  private resolveVerticalCollisions(): void {
    const leftTile = Math.floor(this.player.x / TILE_SIZE);
    const rightTile = Math.floor((this.player.x + this.player.width - 1) / TILE_SIZE);
    const topTile = Math.floor(this.player.y / TILE_SIZE);
    const bottomTile = Math.floor((this.player.y + this.player.height - 1) / TILE_SIZE);

    this.onGround = false;

    if (this.player.vy > 0) {
      // Falling down
      for (let tx = leftTile; tx <= rightTile; tx++) {
        const tile = this.level.getTile(tx, bottomTile);
        if (tile?.solid) {
          this.player.y = bottomTile * TILE_SIZE - this.player.height;
          this.player.vy = 0;
          this.onGround = true;
          break;
        }
      }
    } else if (this.player.vy < 0) {
      // Jumping up
      for (let tx = leftTile; tx <= rightTile; tx++) {
        const tile = this.level.getTile(tx, topTile);
        if (tile?.solid) {
          this.player.y = (topTile + 1) * TILE_SIZE;
          this.player.vy = 0;
          break;
        }
      }
    }
  }

  private checkCoins(): void {
    const playerTileX = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const playerTileY = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);
    
    const tile = this.level.getTile(playerTileX, playerTileY);
    if (tile?.index === 2) {
      this.level.setTile(playerTileX, playerTileY, { index: 0, solid: false });
      this.coins++;
      Audio.prototype.coin.call(this.audio);
    }
  }

  private checkFlag(): void {
    const playerTileX = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const playerTileY = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);
    
    const tile = this.level.getTile(playerTileX, playerTileY);
    if (tile?.index === 3) {
      this.levelComplete = true;
      this.levelCompleteTimer = 2;
      Audio.prototype.beep.call(this.audio);
    }
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    // Draw level
    this.level.draw(renderer, this.cameraX, 0);

    // Draw player
    renderer.drawRect(
      this.player.x - this.cameraX,
      this.player.y,
      this.player.width,
      this.player.height,
      this.player.colorIndex
    );

    // Draw HUD
    renderer.drawText(`COINS: ${this.coins}/${this.totalCoins}`, 4, 4, 3, 8);
    renderer.drawText(`LEVEL ${this.currentLevel + 1}`, 100, 4, 2, 8);

    if (this.levelComplete) {
      renderer.drawText('LEVEL COMPLETE!', 35, 64, 3, 12);
    }

    if (this.gameWon) {
      renderer.drawText('YOU WIN!', 55, 60, 3, 12);
      renderer.drawText('PRESS START', 40, 80, 2, 8);
    }
  }
}