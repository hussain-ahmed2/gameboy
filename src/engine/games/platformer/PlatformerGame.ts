/**
 * @file PlatformerGame.ts
 * @description Side-scrolling platformer - jump, collect coins, reach flag.
 */

import { Game, Sprite, TileMap } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { Audio, SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const GRAVITY = 400;
const JUMP_VELOCITY = -180;
const MOVE_SPEED = 60;
const MAX_FALL_SPEED = 200;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.1;
const TILE_SIZE = 8;

const HIGHSCORE_KEY = 'platformer_highscore';

interface Level {
  tiles: number[][];
  coins: { x: number; y: number }[];
  flag: { x: number; y: number };
  spawnX: number;
  spawnY: number;
}

const LEVELS: Level[] = [
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

interface PlatformerSaveState {
  player: { x: number; y: number; vx: number; vy: number };
  currentLevel: number;
  coins: number;
  totalCoins: number;
  cameraX: number;
  onGround: boolean;
  levelTiles: number[][];
}

export class PlatformerGame extends Game {
  readonly gameId = 'platformer';

  private player!: Sprite;
  private level!: TileMap;
  private currentLevel = 0;
  private _coins = 0;
  private totalCoins = 0;
  private cameraX = 0;
  private onGround = false;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private _gameWon = false;
  private _gameOver = false;
  private levelComplete = false;
  private levelCompleteTimer = 0;
  private highScore = 0;
  private levelTiles: number[][] = [];

  init(): void {
    // Load high score
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this._coins = 0;
    this.currentLevel = 0;
    this._gameWon = false;
    this._gameOver = false;
    this.loadLevel(0);
  }

  private loadLevel(levelIndex: number): void {
    const levelData = LEVELS[levelIndex];
    
    // Store level tiles for save state
    this.levelTiles = levelData.tiles.map(row => [...row]);
    
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
        { x: 0, y: 0, w: 8, h: 8, duration: 200 },
        { x: 8, y: 0, w: 8, h: 8, duration: 100 },
        { x: 16, y: 0, w: 8, h: 8, duration: 100 },
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
    if (this._gameWon || this._gameOver) {
      if (input.start) {
        this.init();
      }
      return;
    }

    if (this.levelComplete) {
      this.levelCompleteTimer -= deltaTime;
      if (this.levelCompleteTimer <= 0) {
        this.currentLevel++;
        if (this.currentLevel >= LEVELS.length) {
          this._gameWon = true;
          // Update high score
          if (this._coins > this.highScore) {
            this.highScore = this._coins;
            SaveState.save(HIGHSCORE_KEY, this.highScore);
          }
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
      this.audio.jump();
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

    // Check if fell off screen
    if (this.player.y > GAME_HEIGHT) {
      this._gameOver = true;
      this.audio.explosion();
      return;
    }

    // Camera follow
    this.cameraX = Math.max(0, Math.min(
      this.player.x - GAME_WIDTH / 2,
      this.level.width * TILE_SIZE - GAME_WIDTH
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
      for (let ty = topTile; ty <= bottomTile; ty++) {
        const tile = this.level.getTile(rightTile, ty);
        if (tile?.solid) {
          this.player.x = rightTile * TILE_SIZE - this.player.width;
          this.player.vx = 0;
          break;
        }
      }
    } else if (this.player.vx < 0) {
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
      this._coins++;
      this.audio.coin();
    }
  }

  private checkFlag(): void {
    const playerTileX = Math.floor((this.player.x + this.player.width / 2) / TILE_SIZE);
    const playerTileY = Math.floor((this.player.y + this.player.height / 2) / TILE_SIZE);
    
    const tile = this.level.getTile(playerTileX, playerTileY);
    if (tile?.index === 3) {
      this.levelComplete = true;
      this.levelCompleteTimer = 2;
      this.audio.beep();
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

    // HUD background to cover game world behind it
    renderer.drawRect(0, 0, GAME_WIDTH, HUD_HEIGHT, 0);
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);
    renderer.drawText(`COINS:${this._coins}/${this.totalCoins}`, 4, 2, 3);
    renderer.drawText(`LVL${this.currentLevel + 1}`, 120, 2, 2);

    if (this.levelComplete) {
      renderer.drawTextCentered('LEVEL COMPLETE!', 64, 3);
    }

    if (this._gameWon) {
      renderer.drawTextCentered('YOU WIN!', 56, 3);
      renderer.drawTextCentered('PRESS START', 72, 2);
    }

    if (this._gameOver) {
      renderer.drawTextCentered('GAME OVER', 56, 3);
      renderer.drawTextCentered('PRESS START', 72, 2);
    }
  }

  getScore(): number {
    return this._coins;
  }

  getHighScore(): number {
    return this.highScore;
  }

  isGameOver(): boolean {
    return this._gameOver || this._gameWon;
  }

  saveState(): object {
    return {
      player: {
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
      },
      currentLevel: this.currentLevel,
      coins: this._coins,
      totalCoins: this.totalCoins,
      cameraX: this.cameraX,
      onGround: this.onGround,
      levelTiles: this.levelTiles,
    };
  }

  loadState(state: object): void {
    const s = state as PlatformerSaveState;
    this.player.x = s.player.x;
    this.player.y = s.player.y;
    this.player.vx = s.player.vx;
    this.player.vy = s.player.vy;
    this.currentLevel = s.currentLevel;
    this._coins = s.coins;
    this.totalCoins = s.totalCoins;
    this.cameraX = s.cameraX;
    this.onGround = s.onGround;
    this._gameOver = false;
    this._gameWon = false;
    this.levelComplete = false;

    // Reload level with saved tiles
    if (s.levelTiles) {
      this.levelTiles = s.levelTiles;
      this.level = new TileMap({
        width: s.levelTiles[0].length,
        height: s.levelTiles.length,
        tileSize: TILE_SIZE,
      });

      for (let y = 0; y < s.levelTiles.length; y++) {
        for (let x = 0; x < s.levelTiles[y].length; x++) {
          const tileType = s.levelTiles[y][x];
          if (tileType === 1) {
            this.level.setTile(x, y, { index: 1, solid: true, colorIndex: 2 });
          } else if (tileType === 2) {
            this.level.setTile(x, y, { index: 2, solid: false, colorIndex: 3 });
          } else if (tileType === 3) {
            this.level.setTile(x, y, { index: 3, solid: false, colorIndex: 3 });
          }
        }
      }
    }
  }
}
