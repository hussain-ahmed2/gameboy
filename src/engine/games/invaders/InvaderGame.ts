/**
 * @file InvaderGame.ts
 * @description Classic Space Invaders - defend Earth from alien invaders.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const PLAYER_WIDTH = 8;
const PLAYER_HEIGHT = 8;
const PLAYER_SPEED = 80;
const BULLET_WIDTH = 2;
const BULLET_HEIGHT = 6;
const PLAYER_BULLET_SPEED = 100;
const ALIEN_BULLET_SPEED = 40;
const ALIEN_ROWS = 5;
const ALIEN_COLS = 8;
const ALIEN_SIZE = 8;
const ALIEN_SPACING_X = 10;
const ALIEN_SPACING_Y = 10;
const ALIEN_BASE_SPEED = 15;
const ALIEN_DROP = 8;
const SHIELD_COUNT = 4;
const SHIELD_WIDTH = 16;
const SHIELD_HEIGHT = 8;
const MAX_LIVES = 3;
const MAX_ALIEN_BULLETS = 3;
const ALIEN_SHOOT_INTERVAL_MIN = 1.0;
const ALIEN_SHOOT_INTERVAL_MAX = 3.0;
const ALIEN_SCORE_TOP = 5;
const ALIEN_SCORE_BOTTOM = 1;

const HIGHSCORE_KEY = 'invaders_highscore';

interface AlienBullet {
  x: number;
  y: number;
  active: boolean;
}

interface ShieldBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
}

interface InvaderSaveState {
  playerX: number;
  playerY: number;
  score: number;
  lives: number;
  alienDirX: number;
  alienSpeed: number;
  alienMoveTimer: number;
  alienMoveInterval: number;
  alienAnimFrame: number;
  alienBullets: AlienBullet[];
  playerBullet: { x: number; y: number; active: boolean } | null;
  shields: ShieldBlock[];
  alienShootTimer: number;
  nextAlienShootTime: number;
}

export class InvaderGame extends Game {
  readonly gameId = 'invaders';

  private playerX = 0;
  private playerY = 0;
  private _score = 0;
  private lives = MAX_LIVES;
  private _gameOver = false;
  private highScore = 0;

  // Aliens
  private aliens: { x: number; y: number; alive: boolean; row: number; col: number }[] = [];
  private alienDirX = 1;
  private alienSpeed = ALIEN_BASE_SPEED;
  private alienMoveTimer = 0;
  private alienMoveInterval = 0.5;
  private alienAnimFrame = 0;

  // Bullets
  private playerBullet: { x: number; y: number; active: boolean } | null = null;
  private alienBullets: AlienBullet[] = [];
  private alienShootTimer = 0;
  private nextAlienShootTime = ALIEN_SHOOT_INTERVAL_MIN;

  // Shields
  private shields: ShieldBlock[] = [];

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this.resetGame();
  }

  private resetGame(): void {
    this._score = 0;
    this.lives = MAX_LIVES;
    this._gameOver = false;
    this.playerX = (GAME_WIDTH - PLAYER_WIDTH) / 2;
    this.playerY = GAME_HEIGHT - 14;

    // Init aliens
    this.aliens = [];
    const alienStartX = (GAME_WIDTH - ALIEN_COLS * ALIEN_SPACING_X) / 2 + 1;
    const alienStartY = HUD_HEIGHT + 4;
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        this.aliens.push({
          x: alienStartX + col * ALIEN_SPACING_X,
          y: alienStartY + row * ALIEN_SPACING_Y,
          alive: true,
          row,
          col,
        });
      }
    }

    this.alienDirX = 1;
    this.alienSpeed = ALIEN_BASE_SPEED;
    this.alienMoveTimer = 0;
    this.alienMoveInterval = 0.5;
    this.alienAnimFrame = 0;

    // Bullets
    this.playerBullet = null;
    this.alienBullets = [];
    this.alienShootTimer = 0;
    this.nextAlienShootTime = ALIEN_SHOOT_INTERVAL_MIN;

    // Shields
    this.initShields();
  }

  private initShields(): void {
    this.shields = [];
    const totalShieldWidth = SHIELD_COUNT * SHIELD_WIDTH;
    const gap = (GAME_WIDTH - totalShieldWidth) / (SHIELD_COUNT + 1);

    for (let i = 0; i < SHIELD_COUNT; i++) {
      const x = gap + i * (SHIELD_WIDTH + gap);
      const y = this.playerY - 16;
      // Create each shield as a simple block
      this.shields.push({ x, y, w: SHIELD_WIDTH, h: SHIELD_HEIGHT, active: true });
    }
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) {
      return;
    }

    // Player movement
    if (input.left) {
      this.playerX -= PLAYER_SPEED * deltaTime;
    }
    if (input.right) {
      this.playerX += PLAYER_SPEED * deltaTime;
    }
    this.playerX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, this.playerX));

    // Player shooting
    if (input.a && !this.playerBullet) {
      this.playerBullet = {
        x: this.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: this.playerY - BULLET_HEIGHT,
        active: true,
      };
      this.audio.beep();
    }

    // Player bullet movement
    if (this.playerBullet && this.playerBullet.active) {
      this.playerBullet.y -= PLAYER_BULLET_SPEED * deltaTime;
      if (this.playerBullet.y < HUD_HEIGHT) {
        this.playerBullet = null;
      }
    }

    // Alien movement
    this.alienMoveTimer += deltaTime;
    if (this.alienMoveTimer >= this.alienMoveInterval) {
      this.alienMoveTimer = 0;
      this.moveAliens();
    }

    // Alien shooting
    this.alienShootTimer += deltaTime;
    if (this.alienShootTimer >= this.nextAlienShootTime) {
      this.alienShootTimer = 0;
      this.alienShoot();
      this.nextAlienShootTime = ALIEN_SHOOT_INTERVAL_MIN +
        Math.random() * (ALIEN_SHOOT_INTERVAL_MAX - ALIEN_SHOOT_INTERVAL_MIN);
    }

    // Alien bullets movement
    for (const bullet of this.alienBullets) {
      if (bullet.active) {
        bullet.y += ALIEN_BULLET_SPEED * deltaTime;
        if (bullet.y > GAME_HEIGHT) {
          bullet.active = false;
        }
      }
    }

    // Collision: player bullet vs aliens
    if (this.playerBullet && this.playerBullet.active) {
      for (const alien of this.aliens) {
        if (!alien.alive) continue;
        if (this.checkCollision(
          this.playerBullet.x, this.playerBullet.y, BULLET_WIDTH, BULLET_HEIGHT,
          alien.x, alien.y, ALIEN_SIZE, ALIEN_SIZE
        )) {
          alien.alive = false;
          this.playerBullet = null;
          this._score += ALIEN_SCORE_TOP - alien.row * ((ALIEN_SCORE_TOP - ALIEN_SCORE_BOTTOM) / (ALIEN_ROWS - 1));
          this.audio.explosion();
          this.updateAlienSpeed();
          this.updateHighScore();
          break;
        }
      }
    }

    // Collision: player bullet vs shields
    if (this.playerBullet && this.playerBullet.active) {
      for (const shield of this.shields) {
        if (!shield.active) continue;
        if (this.checkCollision(
          this.playerBullet.x, this.playerBullet.y, BULLET_WIDTH, BULLET_HEIGHT,
          shield.x, shield.y, shield.w, shield.h
        )) {
          shield.active = false;
          this.playerBullet = null;
          break;
        }
      }
    }

    // Collision: alien bullets vs player
    for (const bullet of this.alienBullets) {
      if (!bullet.active) continue;
      if (this.checkCollision(
        bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT,
        this.playerX, this.playerY, PLAYER_WIDTH, PLAYER_HEIGHT
      )) {
        bullet.active = false;
        this.playerHit();
        break;
      }
    }

    // Collision: alien bullets vs shields
    for (const bullet of this.alienBullets) {
      if (!bullet.active) continue;
      for (const shield of this.shields) {
        if (!shield.active) continue;
        if (this.checkCollision(
          bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT,
          shield.x, shield.y, shield.w, shield.h
        )) {
          bullet.active = false;
          shield.active = false;
          break;
        }
      }
    }

    // Collision: aliens vs shields
    for (const alien of this.aliens) {
      if (!alien.alive) continue;
      for (const shield of this.shields) {
        if (!shield.active) continue;
        if (this.checkCollision(
          alien.x, alien.y, ALIEN_SIZE, ALIEN_SIZE,
          shield.x, shield.y, shield.w, shield.h
        )) {
          shield.active = false;
        }
      }
    }

    // Check if aliens reached player row
    for (const alien of this.aliens) {
      if (alien.alive && alien.y + ALIEN_SIZE >= this.playerY) {
        this._gameOver = true;
        return;
      }
    }

    // Clean up inactive bullets
    this.alienBullets = this.alienBullets.filter(b => b.active);

    // Check win
    if (this.aliens.every(a => !a.alive)) {
      this.resetAliens();
    }
  }

  private moveAliens(): void {
    const aliveAliens = this.aliens.filter(a => a.alive);
    if (aliveAliens.length === 0) return;

    // Check edges
    let hitEdge = false;
    for (const alien of aliveAliens) {
      const nextX = alien.x + this.alienDirX * 2;
      if (nextX <= 0 || nextX + ALIEN_SIZE >= GAME_WIDTH) {
        hitEdge = true;
        break;
      }
    }

    if (hitEdge) {
      // Move down and reverse direction
      for (const alien of aliveAliens) {
        alien.y += ALIEN_DROP;
      }
      this.alienDirX *= -1;
    } else {
      for (const alien of aliveAliens) {
        alien.x += this.alienDirX * 2;
      }
    }

    this.alienAnimFrame = (this.alienAnimFrame + 1) % 2;
  }

  private alienShoot(): void {
    if (this.alienBullets.filter(b => b.active).length >= MAX_ALIEN_BULLETS) return;

    const aliveAliens = this.aliens.filter(a => a.alive);
    if (aliveAliens.length === 0) return;

    // Pick a random alive alien
    const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];

    this.alienBullets.push({
      x: shooter.x + ALIEN_SIZE / 2 - BULLET_WIDTH / 2,
      y: shooter.y + ALIEN_SIZE,
      active: true,
    });
  }

  private playerHit(): void {
    this.lives--;
    this.audio.boop();

    if (this.lives <= 0) {
      this._gameOver = true;
    } else {
      // Reset player position
      this.playerX = (GAME_WIDTH - PLAYER_WIDTH) / 2;
      this.playerBullet = null;
      this.alienBullets = [];
      this.initShields();
    }
  }

  private resetAliens(): void {
    this.alienDirX = 1;
    this.alienSpeed = ALIEN_BASE_SPEED;
    this.alienMoveTimer = 0;
    this.alienMoveInterval = 0.5;

    const alienStartX = (GAME_WIDTH - ALIEN_COLS * ALIEN_SPACING_X) / 2 + 1;
    const alienStartY = HUD_HEIGHT + 4;
    this.aliens = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        this.aliens.push({
          x: alienStartX + col * ALIEN_SPACING_X,
          y: alienStartY + row * ALIEN_SPACING_Y,
          alive: true,
          row,
          col,
        });
      }
    }
  }

  private updateAlienSpeed(): void {
    const aliveCount = this.aliens.filter(a => a.alive).length;
    const deadCount = ALIEN_ROWS * ALIEN_COLS - aliveCount;
    this.alienSpeed = ALIEN_BASE_SPEED + deadCount * 2;
    this.alienMoveInterval = Math.max(0.05, 0.5 - deadCount * 0.02);
  }

  private updateHighScore(): void {
    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }
  }

  private checkCollision(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    // Draw player ship (triangle shape using rects)
    renderer.drawRect(this.playerX, this.playerY, PLAYER_WIDTH, 2, 3);
    renderer.drawRect(this.playerX + 1, this.playerY - 2, PLAYER_WIDTH - 2, 2, 3);
    renderer.drawRect(this.playerX + 3, this.playerY - 4, 2, 2, 3);

    // Draw aliens
    for (const alien of this.aliens) {
      if (!alien.alive) continue;
      // Simple alien shape
      if (this.alienAnimFrame === 0) {
        renderer.drawRect(alien.x + 1, alien.y, 6, 2, 2);
        renderer.drawRect(alien.x, alien.y + 2, 8, 2, 2);
        renderer.drawRect(alien.x + 1, alien.y + 4, 2, 2, 2);
        renderer.drawRect(alien.x + 5, alien.y + 4, 2, 2, 2);
      } else {
        renderer.drawRect(alien.x + 1, alien.y, 6, 2, 2);
        renderer.drawRect(alien.x, alien.y + 2, 8, 2, 2);
        renderer.drawRect(alien.x, alien.y + 4, 2, 2, 2);
        renderer.drawRect(alien.x + 6, alien.y + 4, 2, 2, 2);
      }
    }

    // Draw shields
    for (const shield of this.shields) {
      if (shield.active) {
        renderer.drawRect(shield.x, shield.y, shield.w, shield.h, 1);
      }
    }

    // Draw player bullet
    if (this.playerBullet && this.playerBullet.active) {
      renderer.drawRect(this.playerBullet.x, this.playerBullet.y, BULLET_WIDTH, BULLET_HEIGHT, 3);
    }

    // Draw alien bullets
    for (const bullet of this.alienBullets) {
      if (bullet.active) {
        renderer.drawRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT, 2);
      }
    }

    // HUD separator
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);

    // HUD - score
    renderer.drawText(`SCORE:${this._score}`, 4, 4, 3);

    // HUD - lives
    for (let i = 0; i < this.lives; i++) {
      renderer.drawRect(GAME_WIDTH - 8 - i * 10, 4, 6, 6, 3);
    }
  }

  getScore(): number {
    return this._score;
  }

  getHighScore(): number {
    return Math.max(this.highScore, this._score);
  }

  isGameOver(): boolean {
    return this._gameOver;
  }

  saveState(): object {
    return {
      playerX: this.playerX,
      playerY: this.playerY,
      score: this._score,
      lives: this.lives,
      alienDirX: this.alienDirX,
      alienSpeed: this.alienSpeed,
      alienMoveTimer: this.alienMoveTimer,
      alienMoveInterval: this.alienMoveInterval,
      alienAnimFrame: this.alienAnimFrame,
      alienBullets: this.alienBullets.map(b => ({ ...b })),
      playerBullet: this.playerBullet ? { ...this.playerBullet } : null,
      shields: this.shields.map(s => ({ ...s })),
      alienShootTimer: this.alienShootTimer,
      nextAlienShootTime: this.nextAlienShootTime,
    };
  }

  loadState(state: object): void {
    const s = state as InvaderSaveState;
    this.playerX = s.playerX;
    this.playerY = s.playerY;
    this._score = s.score;
    this.lives = s.lives;
    this.alienDirX = s.alienDirX;
    this.alienSpeed = s.alienSpeed;
    this.alienMoveTimer = s.alienMoveTimer ?? 0;
    this.alienMoveInterval = s.alienMoveInterval ?? 0.5;
    this.alienAnimFrame = s.alienAnimFrame ?? 0;
    this.alienBullets = s.alienBullets.map(b => ({ ...b }));
    this.playerBullet = s.playerBullet ? { ...s.playerBullet } : null;
    this.shields = s.shields.map(s => ({ ...s }));
    this.alienShootTimer = s.alienShootTimer;
    this.nextAlienShootTime = s.nextAlienShootTime ?? ALIEN_SHOOT_INTERVAL_MIN;
    this._gameOver = false;
  }
}
