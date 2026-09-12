/**
 * @file SpaceImpactGame.ts
 * @description Nokia classic Space Impact - side-scrolling space shooter.
 */

import { Game } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const PLAYER_SIZE = 8;
const PLAYER_SPEED = 80;
const PLAYER_SHOOT_INTERVAL = 0.2;
const BULLET_SIZE = 2;
const PLAYER_BULLET_SPEED = 120;
const ENEMY_BULLET_SPEED = 60;
const MAX_PLAYER_BULLETS = 3;
const MAX_ENEMY_BULLETS = 5;
const POWERUP_SIZE = 6;
const POWERUP_SPEED = 30;
const MAX_LIVES = 3;
const LEVEL_CLEAR_DELAY = 2.0;

const HIGHSCORE_KEY = 'spaceimpact_highscore';

interface Enemy {
  x: number;
  y: number;
  type: number;
  hp: number;
  speed: number;
  shootTimer: number;
  shootInterval: number;
  moveTimer: number;
  movePattern: number;
  active: boolean;
}

interface Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  isPlayer: boolean;
  active: boolean;
  damage: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: string;
  active: boolean;
}

interface Level {
  waves: Wave[];
  hasBoss: boolean;
  bossHp: number;
}

interface Wave {
  enemies: { x: number; y: number; type: number; pattern: number }[];
  delay: number;
}

interface SpaceImpactSaveState {
  playerX: number;
  playerY: number;
  score: number;
  lives: number;
  currentLevel: number;
  waveIndex: number;
  waveTimer: number;
  levelClearTimer: number;
  bossActive: boolean;
  bossX: number;
  bossY: number;
  bossHp: number;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  specialWeapon: string;
  specialAmmo: number;
  shootTimer: number;
}

export class SpaceImpactGame extends Game {
  readonly gameId = 'spaceimpact';

  private playerX = 0;
  private playerY = 0;
  private _score = 0;
  private lives = MAX_LIVES;
  private _gameOver = false;
  private highScore = 0;

  // Level system
  private currentLevel = 1;
  private maxLevel = 8;
  private waveIndex = 0;
  private waveTimer = 0;
  private levelClearTimer = 0;
  private readyTimer = 0;

  // Boss
  private bossActive = false;
  private bossX = 0;
  private bossY = 0;
  private bossHp = 0;
  private bossMaxHp = 0;
  private bossShootTimer = 0;
  private bossMoveDir = 1;

  // Entities
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private powerUps: PowerUp[] = [];

  // Player weapons
  private shootTimer = 0;
  private specialWeapon = 'normal';
  private specialAmmo = 0;

  // Levels definition
  private levels: Level[] = [];

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this.defineLevels();
    this.startGame();
  }

  private defineLevels(): void {
    this.levels = [
      {
        hasBoss: true,
        bossHp: 15,
        waves: [
          { enemies: [
            { x: 165, y: 30, type: 0, pattern: 0 },
            { x: 180, y: 60, type: 0, pattern: 0 },
          ], delay: 0 },
          { enemies: [
            { x: 165, y: 25, type: 0, pattern: 0 },
            { x: 180, y: 50, type: 1, pattern: 1 },
            { x: 170, y: 80, type: 0, pattern: 0 },
          ], delay: 1.5 },
          { enemies: [
            { x: 165, y: 35, type: 1, pattern: 1 },
            { x: 180, y: 65, type: 1, pattern: 1 },
            { x: 175, y: 95, type: 0, pattern: 0 },
          ], delay: 1.5 },
        ],
      },
      {
        hasBoss: true,
        bossHp: 20,
        waves: [
          { enemies: [
            { x: 165, y: 30, type: 0, pattern: 0 },
            { x: 180, y: 50, type: 0, pattern: 0 },
            { x: 170, y: 70, type: 1, pattern: 1 },
          ], delay: 0 },
          { enemies: [
            { x: 165, y: 25, type: 1, pattern: 1 },
            { x: 180, y: 45, type: 1, pattern: 1 },
            { x: 175, y: 65, type: 2, pattern: 0 },
          ], delay: 1.5 },
        ],
      },
      {
        hasBoss: true,
        bossHp: 25,
        waves: [
          { enemies: [
            { x: 165, y: 30, type: 1, pattern: 1 },
            { x: 180, y: 50, type: 2, pattern: 0 },
            { x: 170, y: 70, type: 1, pattern: 1 },
            { x: 185, y: 90, type: 0, pattern: 0 },
          ], delay: 0 },
          { enemies: [
            { x: 165, y: 35, type: 2, pattern: 0 },
            { x: 180, y: 55, type: 2, pattern: 0 },
            { x: 175, y: 75, type: 1, pattern: 1 },
          ], delay: 1.5 },
        ],
      },
    ];

    // Generate remaining levels
    for (let i = this.levels.length; i < this.maxLevel; i++) {
      const waveCount = 3 + Math.floor(i / 2);
      const waves: Wave[] = [];
      for (let w = 0; w < waveCount; w++) {
        const enemyCount = 3 + Math.floor(w / 2);
        const enemies = [];
        for (let e = 0; e < enemyCount; e++) {
          enemies.push({
            x: 165 + Math.random() * 20,
            y: 25 + Math.random() * 80,
            type: Math.min(2, Math.floor(i / 3)),
            pattern: Math.floor(Math.random() * 2),
          });
        }
        waves.push({ enemies, delay: 1.5 });
      }
      this.levels.push({
        hasBoss: true,
        bossHp: 20 + i * 5,
        waves,
      });
    }
  }

  private startGame(): void {
    this._score = 0;
    this.lives = MAX_LIVES;
    this._gameOver = false;
    this.currentLevel = 1;
    this.initLevel();
  }

  private initLevel(): void {
    const level = this.levels[this.currentLevel - 1];
    this.waveIndex = 0;
    this.waveTimer = level.waves[0]?.delay ?? 0;
    this.levelClearTimer = 0;
    this.readyTimer = 2.0;

    this.playerX = 20;
    this.playerY = (GAME_HEIGHT - PLAYER_SIZE) / 2;
    this.shootTimer = 0;
    this.specialWeapon = 'normal';
    this.specialAmmo = 0;

    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.bossActive = false;
    this.bossShootTimer = 0;
    this.bossMoveDir = 1;

    this.spawnWave();
  }

  private spawnWave(): void {
    const level = this.levels[this.currentLevel - 1];
    if (this.waveIndex >= level.waves.length) return;

    const wave = level.waves[this.waveIndex];
    for (const def of wave.enemies) {
      this.enemies.push({
        x: def.x,
        y: def.y,
        type: def.type,
        hp: def.type === 0 ? 1 : def.type === 1 ? 2 : 3,
        speed: 15 + def.type * 10,
        shootTimer: 0,
        shootInterval: def.type === 2 ? 1.5 : 2.5,
        moveTimer: 0,
        movePattern: def.pattern,
        active: true,
      });
    }
  }

  private spawnBoss(): void {
    const level = this.levels[this.currentLevel - 1];
    this.bossActive = true;
    this.bossX = GAME_WIDTH - 20;
    this.bossY = (GAME_HEIGHT - 16) / 2;
    this.bossHp = level.bossHp;
    this.bossMaxHp = level.bossHp;
    this.bossShootTimer = 0;
    this.bossMoveDir = 1;
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) return;

    if (this.readyTimer > 0) {
      this.readyTimer -= deltaTime;
      return;
    }

    if (this.levelClearTimer > 0) {
      this.levelClearTimer -= deltaTime;
      if (this.levelClearTimer <= 0) {
        if (this.currentLevel >= this.maxLevel) {
          this._gameOver = true;
        } else {
          this.currentLevel++;
          this.initLevel();
        }
      }
      return;
    }

    // Player movement
    if (input.up) this.playerY -= PLAYER_SPEED * deltaTime;
    if (input.down) this.playerY += PLAYER_SPEED * deltaTime;
    if (input.left) this.playerX -= PLAYER_SPEED * deltaTime;
    if (input.right) this.playerX += PLAYER_SPEED * deltaTime;

    // Clamp player to left half of screen
    this.playerX = Math.max(0, Math.min(GAME_WIDTH / 2 - PLAYER_SIZE, this.playerX));
    this.playerY = Math.max(HUD_HEIGHT, Math.min(GAME_HEIGHT - PLAYER_SIZE, this.playerY));

    // Player shooting
    this.shootTimer -= deltaTime;
    if (input.a && this.shootTimer <= 0) {
      this.playerShoot();
      this.shootTimer = PLAYER_SHOOT_INTERVAL;
    }

    // Update bullets
    this.updateBullets(deltaTime);

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update boss
    if (this.bossActive) {
      this.updateBoss(deltaTime);
    }

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Check wave/level progression
    this.checkProgression(deltaTime);
  }

  private playerShoot(): void {
    const activeBullets = this.bullets.filter(b => b.isPlayer && b.active);
    if (activeBullets.length >= MAX_PLAYER_BULLETS) return;

    if (this.specialWeapon !== 'normal' && this.specialAmmo > 0) {
      // Special weapon
      if (this.specialWeapon === 'spread') {
        this.bullets.push(
          { x: this.playerX + PLAYER_SIZE, y: this.playerY + 2, dx: PLAYER_BULLET_SPEED, dy: 0, isPlayer: true, active: true, damage: 1 },
          { x: this.playerX + PLAYER_SIZE, y: this.playerY + 2, dx: PLAYER_BULLET_SPEED, dy: -30, isPlayer: true, active: true, damage: 1 },
          { x: this.playerX + PLAYER_SIZE, y: this.playerY + 2, dx: PLAYER_BULLET_SPEED, dy: 30, isPlayer: true, active: true, damage: 1 },
        );
      } else if (this.specialWeapon === 'laser') {
        this.bullets.push(
          { x: this.playerX + PLAYER_SIZE, y: this.playerY + 3, dx: PLAYER_BULLET_SPEED * 1.5, dy: 0, isPlayer: true, active: true, damage: 2 },
        );
      }
      this.specialAmmo--;
      if (this.specialAmmo <= 0) this.specialWeapon = 'normal';
    } else {
      // Normal shot
      this.bullets.push({
        x: this.playerX + PLAYER_SIZE,
        y: this.playerY + 3,
        dx: PLAYER_BULLET_SPEED,
        dy: 0,
        isPlayer: true,
        active: true,
        damage: 1,
      });
    }
    this.audio.beep();
  }

  private updateBullets(dt: number): void {
    for (const b of this.bullets) {
      if (!b.active) continue;
      b.x += b.dx * dt;
      b.y += b.dy * dt;
      if (b.x < -10 || b.x > GAME_WIDTH + 10 || b.y < -10 || b.y > GAME_HEIGHT + 10) {
        b.active = false;
      }
    }
    this.bullets = this.bullets.filter(b => b.active);
  }

  private updateEnemies(dt: number): void {
    for (const e of this.enemies) {
      if (!e.active) continue;

      // Move towards player
      e.x -= e.speed * dt;

      // Vertical movement pattern
      e.moveTimer += dt;
      if (e.movePattern === 0) {
        // Sine wave
        e.y += Math.sin(e.moveTimer * 3) * 30 * dt;
      } else {
        // Chase player
        const dy = this.playerY - e.y;
        e.y += Math.sign(dy) * Math.min(Math.abs(dy), e.speed * dt);
      }

      // Clamp
      e.y = Math.max(HUD_HEIGHT, Math.min(GAME_HEIGHT - 8, e.y));

      // Shoot
      if (e.type >= 1) {
        e.shootTimer += dt;
        if (e.shootTimer >= e.shootInterval) {
          e.shootTimer = 0;
          this.enemyShoot(e);
        }
      }

      // Remove if off screen
      if (e.x < -10) {
        e.active = false;
      }
    }
    this.enemies = this.enemies.filter(e => e.active);
  }

  private enemyShoot(enemy: Enemy): void {
    const activeEnemyBullets = this.bullets.filter(b => !b.isPlayer && b.active);
    if (activeEnemyBullets.length >= MAX_ENEMY_BULLETS) return;

    const dx = this.playerX - enemy.x;
    const dy = this.playerY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    this.bullets.push({
      x: enemy.x,
      y: enemy.y + 4,
      dx: (dx / dist) * ENEMY_BULLET_SPEED,
      dy: (dy / dist) * ENEMY_BULLET_SPEED,
      isPlayer: false,
      active: true,
      damage: 1,
    });
  }

  private updateBoss(dt: number): void {
    if (!this.bossActive) return;

    // Move vertically
    this.bossY += this.bossMoveDir * 20 * dt;
    if (this.bossY <= HUD_HEIGHT || this.bossY >= GAME_HEIGHT - 16) {
      this.bossMoveDir *= -1;
    }

    // Shoot at player
    this.bossShootTimer += dt;
    if (this.bossShootTimer >= 0.8) {
      this.bossShootTimer = 0;
      const dx = this.playerX - this.bossX;
      const dy = this.playerY - this.bossY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        this.bullets.push({
          x: this.bossX,
          y: this.bossY + 8,
          dx: (dx / dist) * ENEMY_BULLET_SPEED * 0.8,
          dy: (dy / dist) * ENEMY_BULLET_SPEED * 0.8,
          isPlayer: false,
          active: true,
          damage: 1,
        });
        // Double shot
        this.bullets.push({
          x: this.bossX,
          y: this.bossY + 8,
          dx: (dx / dist) * ENEMY_BULLET_SPEED * 0.8,
          dy: (dy / dist + 0.3) * ENEMY_BULLET_SPEED * 0.8,
          isPlayer: false,
          active: true,
          damage: 1,
        });
      }
    }
  }

  private updatePowerUps(dt: number): void {
    for (const p of this.powerUps) {
      if (!p.active) continue;
      p.x -= POWERUP_SPEED * dt;
      if (p.x < -10) p.active = false;
    }
    this.powerUps = this.powerUps.filter(p => p.active);
  }

  private checkCollisions(): void {
    // Player bullets vs enemies
    for (const b of this.bullets) {
      if (!b.active || !b.isPlayer) continue;
      for (const e of this.enemies) {
        if (!e.active) continue;
        if (this.rectCollide(b.x, b.y, BULLET_SIZE, BULLET_SIZE, e.x, e.y, 8, 8)) {
          e.hp -= b.damage;
          b.active = false;
          if (e.hp <= 0) {
            e.active = false;
            this._score += (e.type + 1) * 10;
            this.audio.explosion();
            this.maybeSpawnPowerUp(e.x, e.y);
            this.updateHighScore();
          } else {
            this.audio.boop();
          }
          break;
        }
      }
    }

    // Player bullets vs boss
    if (this.bossActive) {
      for (const b of this.bullets) {
        if (!b.active || !b.isPlayer) continue;
        if (this.rectCollide(b.x, b.y, BULLET_SIZE, BULLET_SIZE, this.bossX, this.bossY, 16, 16)) {
          b.active = false;
          this.bossHp -= b.damage;
          this.audio.boop();
          if (this.bossHp <= 0) {
            this.bossActive = false;
            this._score += 100;
            this.audio.explosion();
            this.updateHighScore();
            this.levelClearTimer = LEVEL_CLEAR_DELAY;
          }
          break;
        }
      }
    }

    // Enemy bullets vs player
    for (const b of this.bullets) {
      if (!b.active || b.isPlayer) continue;
      if (this.rectCollide(b.x, b.y, BULLET_SIZE, BULLET_SIZE, this.playerX, this.playerY, PLAYER_SIZE, PLAYER_SIZE)) {
        b.active = false;
        this.playerHit();
        break;
      }
    }

    // Enemies vs player
    for (const e of this.enemies) {
      if (!e.active) continue;
      if (this.rectCollide(e.x, e.y, 8, 8, this.playerX, this.playerY, PLAYER_SIZE, PLAYER_SIZE)) {
        e.active = false;
        this.playerHit();
        break;
      }
    }

    // Boss vs player
    if (this.bossActive) {
      if (this.rectCollide(this.bossX, this.bossY, 16, 16, this.playerX, this.playerY, PLAYER_SIZE, PLAYER_SIZE)) {
        this.playerHit();
      }
    }

    // Player vs power-ups
    for (const p of this.powerUps) {
      if (!p.active) continue;
      if (this.rectCollide(p.x, p.y, POWERUP_SIZE, POWERUP_SIZE, this.playerX, this.playerY, PLAYER_SIZE, PLAYER_SIZE)) {
        p.active = false;
        this.collectPowerUp(p.type);
      }
    }
  }

  private rectCollide(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  private maybeSpawnPowerUp(x: number, y: number): void {
    if (Math.random() > 0.3) return; // 30% chance
    const types = ['spread', 'laser', 'life'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push({ x, y, type, active: true });
  }

  private collectPowerUp(type: string): void {
    if (type === 'life') {
      this.lives = Math.min(this.lives + 1, MAX_LIVES);
      this.audio.coin();
    } else if (type === 'spread') {
      this.specialWeapon = 'spread';
      this.specialAmmo = 15;
      this.audio.coin();
    } else if (type === 'laser') {
      this.specialWeapon = 'laser';
      this.specialAmmo = 10;
      this.audio.coin();
    }
  }

  private playerHit(): void {
    this.lives--;
    this.audio.boop();

    if (this.lives <= 0) {
      this._gameOver = true;
      this.audio.explosion();
    } else {
      this.playerX = 20;
      this.playerY = (GAME_HEIGHT - PLAYER_SIZE) / 2;
      this.bullets = this.bullets.filter(b => b.isPlayer);
      this.readyTimer = 1.5;
    }
  }

  private checkProgression(dt: number): void {
    const level = this.levels[this.currentLevel - 1];

    // Spawn next wave if current cleared
    if (this.enemies.length === 0 && !this.bossActive && this.levelClearTimer <= 0) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.waveIndex++;
        if (this.waveIndex < level.waves.length) {
          this.waveTimer = level.waves[this.waveIndex].delay;
          this.spawnWave();
        } else if (level.hasBoss) {
          this.spawnBoss();
        } else {
          this.levelClearTimer = LEVEL_CLEAR_DELAY;
        }
      }
    }
  }

  private updateHighScore(): void {
    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    // Draw scrolling starfield background (parallax layers)
    const time = Date.now() / 1000;
    // Far stars (slow)
    for (let i = 0; i < 15; i++) {
      const sx = ((i * 37 + 11 + time * 8) % GAME_WIDTH) | 0;
      const sy = (i * 53 + 7) % (GAME_HEIGHT - HUD_HEIGHT) + HUD_HEIGHT;
      renderer.drawRect(sx, sy, 1, 1, 1);
    }
    // Near stars (fast)
    for (let i = 0; i < 10; i++) {
      const sx = ((i * 41 + 23 + time * 15) % GAME_WIDTH) | 0;
      const sy = (i * 47 + 13) % (GAME_HEIGHT - HUD_HEIGHT) + HUD_HEIGHT;
      renderer.drawRect(sx, sy, 1, 1, 2);
    }

    // ===== PLAYER SHIP (Authentic Nokia 10x7 design) =====
    const px = this.playerX;
    const py = this.playerY;
    // Original Nokia Space Impact player ship - compact 10x7 design
    //     ##           <- nose tip
    //    ####          <- nose
    //   ##  ##         <- cockpit opening
    //  ########        <- main body
    // ## ## ## #       <- wings with engine gap
    //  #  ##  #        <- engine pods
    //   # ## #         <- exhaust
    renderer.drawRect(px + 4, py, 2, 1, 3);       // nose tip
    renderer.drawRect(px + 3, py + 1, 4, 1, 3);   // nose
    renderer.drawRect(px + 2, py + 2, 2, 1, 3);   // cockpit left
    renderer.drawRect(px + 6, py + 2, 2, 1, 3);   // cockpit right
    renderer.drawRect(px + 2, py + 3, 8, 1, 3);   // main body
    renderer.drawRect(px, py + 4, 3, 1, 3);        // left wing
    renderer.drawRect(px + 3, py + 4, 1, 1, 2);    // wing gap
    renderer.drawRect(px + 4, py + 4, 2, 1, 3);    // center
    renderer.drawRect(px + 7, py + 4, 1, 1, 2);    // wing gap
    renderer.drawRect(px + 8, py + 4, 2, 1, 3);    // right wing
    renderer.drawRect(px + 1, py + 5, 2, 1, 2);    // left engine pod
    renderer.drawRect(px + 7, py + 5, 2, 1, 2);    // right engine pod
    // Engine exhaust (animated flicker)
    const exhaustOn = Math.sin(time * 25) > -0.3;
    if (exhaustOn) {
      renderer.drawRect(px + 2, py + 6, 1, 1, 1);  // left exhaust
      renderer.drawRect(px + 7, py + 6, 1, 1, 1);  // right exhaust
    }

    // ===== ENEMIES (Authentic Nokia pixel-art style) =====
    for (const e of this.enemies) {
      if (!e.active) continue;
      
      if (e.type === 0) {
        // Type 0: Small scout drone (8x5)
        // Original Nokia design - insect-like
        //   #  #
        //  ####
        // # ## #
        //  ####
        //   #  #
        renderer.drawRect(e.x + 2, e.y, 1, 1, 3);     // left antenna
        renderer.drawRect(e.x + 5, e.y, 1, 1, 3);     // right antenna
        renderer.drawRect(e.x + 1, e.y + 1, 6, 1, 2); // head
        renderer.drawRect(e.x, e.y + 2, 2, 1, 2);      // left wing
        renderer.drawRect(e.x + 2, e.y + 2, 1, 1, 3);  // left eye
        renderer.drawRect(e.x + 4, e.y + 2, 1, 1, 3);  // right eye
        renderer.drawRect(e.x + 6, e.y + 2, 2, 1, 2);  // right wing
        renderer.drawRect(e.x + 1, e.y + 3, 6, 1, 2);  // body
        renderer.drawRect(e.x + 2, e.y + 4, 1, 1, 1);  // left tail
        renderer.drawRect(e.x + 5, e.y + 4, 1, 1, 1);  // right tail
      } else if (e.type === 1) {
        // Type 1: Medium fighter (9x6)
        // Original Nokia design - winged alien craft
        //    ##
        //   ####
        //  # ## #
        // #  ##  #
        //  # ## #
        //   #  #
        renderer.drawRect(e.x + 3, e.y, 2, 1, 3);      // head
        renderer.drawRect(e.x + 2, e.y + 1, 4, 1, 2);  // neck
        renderer.drawRect(e.x + 1, e.y + 2, 6, 1, 2);  // body
        renderer.drawRect(e.x + 2, e.y + 2, 1, 1, 3);  // left eye
        renderer.drawRect(e.x + 5, e.y + 2, 1, 1, 3);  // right eye
        renderer.drawRect(e.x, e.y + 3, 2, 1, 1);       // left wing tip
        renderer.drawRect(e.x + 2, e.y + 3, 4, 1, 2);  // center
        renderer.drawRect(e.x + 7, e.y + 3, 2, 1, 1);  // right wing tip
        renderer.drawRect(e.x + 1, e.y + 4, 2, 1, 2);  // left mandible
        renderer.drawRect(e.x + 6, e.y + 4, 2, 1, 2);  // right mandible
        renderer.drawRect(e.x + 2, e.y + 5, 1, 1, 1);  // left fang
        renderer.drawRect(e.x + 6, e.y + 5, 1, 1, 1);  // right fang
      } else {
        // Type 2: Heavy cruiser (11x7)
        // Original Nokia design - armored alien vessel
        //    ####
        //   ######
        //  # #### #
        // # ###### #
        //  ########
        //   # ## #
        //    #  #
        renderer.drawRect(e.x + 3, e.y, 4, 1, 3);      // bridge
        renderer.drawRect(e.x + 2, e.y + 1, 6, 1, 2);  // upper hull
        renderer.drawRect(e.x + 1, e.y + 2, 8, 1, 2);  // hull
        renderer.drawRect(e.x + 2, e.y + 2, 1, 1, 3);  // left sensor
        renderer.drawRect(e.x + 7, e.y + 2, 1, 1, 3);  // right sensor
        renderer.drawRect(e.x, e.y + 3, 2, 1, 1);       // left armor
        renderer.drawRect(e.x + 2, e.y + 3, 6, 1, 2);  // center hull
        renderer.drawRect(e.x + 9, e.y + 3, 2, 1, 1);  // right armor
        renderer.drawRect(e.x + 1, e.y + 4, 8, 1, 2);  // lower hull
        renderer.drawRect(e.x + 2, e.y + 5, 2, 1, 1);  // left engine
        renderer.drawRect(e.x + 6, e.y + 5, 2, 1, 1);  // right engine
        renderer.drawRect(e.x + 3, e.y + 6, 1, 1, 1);  // left exhaust
        renderer.drawRect(e.x + 6, e.y + 6, 1, 1, 1);  // right exhaust
      }
    }

    // ===== BOSS (Authentic Nokia large alien design) =====
    if (this.bossActive) {
      const bx = this.bossX;
      const by = this.bossY;
      // Original Nokia boss - large organic alien warship
      //       ########
      //      ##########
      //     ## #### ##
      //    ############
      //   # ########## #
      //  ## ############
      // #  ############  #
      //    ## ##  ## ##
      //     #  #  #  #
      renderer.drawRect(bx + 4, by, 8, 1, 3);          // crown
      renderer.drawRect(bx + 3, by + 1, 10, 1, 2);     // upper head
      renderer.drawRect(bx + 2, by + 2, 4, 1, 2);      // left head
      renderer.drawRect(bx + 6, by + 2, 2, 1, 3);      // eye bridge
      renderer.drawRect(bx + 8, by + 2, 4, 1, 2);      // right head
      renderer.drawRect(bx + 1, by + 3, 12, 1, 2);     // face
      renderer.drawRect(bx, by + 4, 2, 1, 1);           // left armor
      renderer.drawRect(bx + 2, by + 4, 10, 1, 2);     // upper body
      renderer.drawRect(bx + 13, by + 4, 2, 1, 1);     // right armor
      renderer.drawRect(bx, by + 5, 14, 1, 2);         // mid body
      renderer.drawRect(bx + 2, by + 6, 2, 1, 3);      // left mandible base
      renderer.drawRect(bx + 10, by + 6, 2, 1, 3);     // right mandible base
      renderer.drawRect(bx + 1, by + 7, 2, 1, 3);      // left mandible
      renderer.drawRect(bx + 11, by + 7, 2, 1, 3);     // right mandible
      renderer.drawRect(bx + 3, by + 8, 1, 1, 1);      // left claw
      renderer.drawRect(bx + 10, by + 8, 1, 1, 1);     // right claw
      // Engine glow (animated)
      const bossGlow = Math.sin(time * 12) > 0 ? 2 : 1;
      renderer.drawRect(bx + 4, by + 9, 2, 1, bossGlow);
      renderer.drawRect(bx + 8, by + 9, 2, 1, bossGlow);
      // Boss health bar
      const hpRatio = this.bossHp / this.bossMaxHp;
      renderer.drawRect(bx + 1, by - 3, 12, 1, 1);
      renderer.drawRect(bx + 1, by - 3, Math.floor(12 * hpRatio), 1, 3);
    }

    // ===== BULLETS (Authentic Nokia simple design) =====
    for (const b of this.bullets) {
      if (!b.active) continue;
      if (b.isPlayer) {
        // Player bullet: simple 3x1 laser (original Nokia style)
        renderer.drawRect(b.x, b.y, 3, 1, 3);
      } else {
        // Enemy bullet: simple 2x2 energy pellet
        renderer.drawRect(b.x, b.y, 2, 2, 2);
      }
    }

    // ===== POWER-UPS (Authentic Nokia icon style) =====
    for (const p of this.powerUps) {
      if (!p.active) continue;
      // 5x5 icon box (original Nokia style)
      renderer.drawRect(p.x, p.y, 5, 5, 2);
      renderer.drawRect(p.x + 1, p.y + 1, 3, 3, 1);
      
      if (p.type === 'life') {
        // Life icon: small ship silhouette
        renderer.drawRect(p.x + 2, p.y + 1, 1, 1, 3);
        renderer.drawRect(p.x + 1, p.y + 2, 3, 1, 3);
        renderer.drawRect(p.x, p.y + 3, 5, 1, 3);
      } else if (p.type === 'spread') {
        // Spread icon: three-way arrow
        renderer.drawRect(p.x + 2, p.y + 1, 1, 3, 3);
        renderer.drawRect(p.x + 1, p.y + 2, 1, 1, 3);
        renderer.drawRect(p.x + 3, p.y + 2, 1, 1, 3);
      } else {
        // Laser icon: lightning bolt
        renderer.drawRect(p.x + 2, p.y + 1, 1, 1, 3);
        renderer.drawRect(p.x + 1, p.y + 2, 2, 1, 3);
        renderer.drawRect(p.x + 2, p.y + 3, 1, 1, 3);
        renderer.drawRect(p.x + 1, p.y + 4, 2, 1, 3);
      }
    }

    // ===== HUD =====
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);
    
    const scoreText = `${this._score}`;
    const levelText = `L${this.currentLevel}`;
    const livesText = `x${this.lives}`;
    const hiText = `HI:${this.highScore}`;
    
    // Calculate widths (assuming 8px font + 1px spacing = 9px per char)
    const charW = 9;
    const w1 = scoreText.length * charW;
    const w2 = levelText.length * charW;
    const w3 = livesText.length * charW;
    const w4 = hiText.length * charW;
    
    // Dynamic 'space-between' calculation to prevent overlaps
    const totalTextWidth = w1 + w2 + w3 + w4;
    let gap = Math.floor((GAME_WIDTH - 8 - totalTextWidth) / 3);
    if (gap < 2) gap = 2; // enforce minimum gap
    
    let currentX = 4;
    
    renderer.drawText(scoreText, currentX, 4, 3);
    currentX += w1 + gap;
    
    renderer.drawText(levelText, currentX, 4, 2);
    currentX += w2 + gap;
    
    renderer.drawText(livesText, currentX, 4, 3);
    
    // Right-align the high score to the edge of the screen
    renderer.drawText(hiText, GAME_WIDTH - 4 - w4 + 1, 4, 2);

    // Special weapon indicator (bottom left)
    if (this.specialWeapon !== 'normal') {
      renderer.drawText(`${this.specialWeapon.toUpperCase()}:${this.specialAmmo}`, 4, GAME_HEIGHT - 8, 1);
    }

    // ===== OVERLAYS =====
    // Ready overlay
    if (this.readyTimer > 0) {
      renderer.drawTextCentered('GET READY', GAME_HEIGHT / 2, 3);
      renderer.drawTextCentered(`LEVEL ${this.currentLevel}`, GAME_HEIGHT / 2 + 12, 2);
    }

    // Level clear overlay
    if (this.levelClearTimer > 0 && !this._gameOver) {
      renderer.drawTextCentered('LEVEL CLEAR!', GAME_HEIGHT / 2, 3);
      if (this.currentLevel >= this.maxLevel) {
        renderer.drawTextCentered('YOU WIN!', GAME_HEIGHT / 2 + 12, 2);
      }
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
      currentLevel: this.currentLevel,
      waveIndex: this.waveIndex,
      waveTimer: this.waveTimer,
      levelClearTimer: this.levelClearTimer,
      bossActive: this.bossActive,
      bossX: this.bossX,
      bossY: this.bossY,
      bossHp: this.bossHp,
      enemies: this.enemies.map(e => ({ ...e })),
      bullets: this.bullets.map(b => ({ ...b })),
      powerUps: this.powerUps.map(p => ({ ...p })),
      specialWeapon: this.specialWeapon,
      specialAmmo: this.specialAmmo,
      shootTimer: this.shootTimer,
    };
  }

  loadState(state: object): void {
    const s = state as SpaceImpactSaveState;
    this.playerX = s.playerX;
    this.playerY = s.playerY;
    this._score = s.score;
    this.lives = s.lives;
    this.currentLevel = s.currentLevel;
    this.waveIndex = s.waveIndex;
    this.waveTimer = s.waveTimer;
    this.levelClearTimer = s.levelClearTimer;
    this.bossActive = s.bossActive;
    this.bossX = s.bossX;
    this.bossY = s.bossY;
    this.bossHp = s.bossHp;
    this.bossMaxHp = this.levels[this.currentLevel - 1]?.bossHp ?? 15;
    this.enemies = s.enemies.map(e => ({ ...e }));
    this.bullets = s.bullets.map(b => ({ ...b }));
    this.powerUps = s.powerUps.map(p => ({ ...p }));
    this.specialWeapon = s.specialWeapon;
    this.specialAmmo = s.specialAmmo;
    this.shootTimer = s.shootTimer;
    this._gameOver = false;
  }
}
