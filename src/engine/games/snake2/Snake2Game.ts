/**
 * @file Snake2Game.ts
 * @description Snake II - enhanced Snake with teleporters, obstacles, and special food.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const GRID_SIZE = 8;
const GRID_WIDTH = GAME_WIDTH / GRID_SIZE; // 20
const GRID_HEIGHT = GAME_HEIGHT / GRID_SIZE; // 18
const HUD_GRID_Y = Math.ceil(HUD_HEIGHT / GRID_SIZE); // 2 rows for HUD
const PLAY_TOP = HUD_GRID_Y;
const BASE_SPEED = 250;
const MIN_SPEED = 90;

const HIGHSCORE_KEY = 'snake2_highscore';

interface Segment {
  x: number;
  y: number;
}

interface Teleporter {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Snake2SaveState {
  snake: Segment[];
  direction: { x: number; y: number };
  nextDirection: { x: number; y: number };
  food: { x: number; y: number } | null;
  specialFood: { x: number; y: number } | null;
  specialFoodTimer: number;
  score: number;
  moveTimer: number;
  moveInterval: number;
  obstacles: { x: number; y: number }[];
  obstacleThresholdsHit: number[];
}

const TELEPORTERS: Teleporter[] = [
  { x1: 2, y1: 4, x2: 17, y2: 15 },
  { x1: 2, y1: 15, x2: 17, y2: 4 },
];

const SPEED_THRESHOLDS = [5, 10, 20];
const OBSTACLE_THRESHOLDS = [5, 15, 25];

export class Snake2Game extends Game {
  readonly gameId = 'snake2';

  private snake: Segment[] = [];
  private direction: { x: number; y: number } = { x: 1, y: 0 };
  private nextDirection: { x: number; y: number } = { x: 1, y: 0 };
  private food: { x: number; y: number } | null = null;
  private specialFood: { x: number; y: number } | null = null;
  private specialFoodTimer = 0;
  private _score = 0;
  private highScore = 0;
  private _gameOver = false;
  private moveTimer = 0;
  private moveInterval = BASE_SPEED;
  private obstacles: { x: number; y: number }[] = [];
  private obstacleThresholdsHit: number[] = [];
  private animTimer = 0;
  private readyTimer = 0;

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this._score = 0;
    this._gameOver = false;
    this.moveTimer = 0;
    this.moveInterval = BASE_SPEED;
    this.specialFood = null;
    this.specialFoodTimer = 0;
    this.obstacles = [];
    this.obstacleThresholdsHit = [];
    this.animTimer = 0;
    this.readyTimer = 2.0; // 2s start freeze

    this.spawnFood();
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) return;

    if (this.readyTimer > 0) {
      this.readyTimer -= deltaTime;
      // Allow pre-turning while frozen
      if (input.up && this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
      else if (input.down && this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
      else if (input.left && this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
      else if (input.right && this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
      return;
    }

    if (input.up && this.direction.y !== 1) {
      this.nextDirection = { x: 0, y: -1 };
    } else if (input.down && this.direction.y !== -1) {
      this.nextDirection = { x: 0, y: 1 };
    } else if (input.left && this.direction.x !== 1) {
      this.nextDirection = { x: -1, y: 0 };
    } else if (input.right && this.direction.x !== -1) {
      this.nextDirection = { x: 1, y: 0 };
    }

    this.moveTimer += deltaTime * 1000;
    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0;
      this.moveSnake();
    }

    if (this.specialFood) {
      this.specialFoodTimer -= deltaTime * 1000;
      if (this.specialFoodTimer <= 0) {
        this.specialFood = null;
      }
    }

    this.animTimer += deltaTime;
  }

  private moveSnake(): void {
    this.direction = { ...this.nextDirection };

    const head = this.snake[0];
    let newHead: Segment = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // Boundary wrapping (Classic Snake II behavior)
    if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
    else if (newHead.x >= GRID_WIDTH) newHead.x = 0;
    
    if (newHead.y < PLAY_TOP) newHead.y = GRID_HEIGHT - 1;
    else if (newHead.y >= GRID_HEIGHT) newHead.y = PLAY_TOP;

    // Obstacle collision
    if (this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      this.endGame();
      return;
    }

    // Teleporter check
    for (const tp of TELEPORTERS) {
      if (newHead.x === tp.x1 && newHead.y === tp.y1) {
        newHead = { x: tp.x2, y: tp.y2 };
        this.audio.beep();
        break;
      }
      if (newHead.x === tp.x2 && newHead.y === tp.y2) {
        newHead = { x: tp.x1, y: tp.y1 };
        this.audio.beep();
        break;
      }
    }

    // Obstacle collision at teleporter destination
    if (this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      this.endGame();
      return;
    }

    // Self collision
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === newHead.x && this.snake[i].y === newHead.y) {
        this.endGame();
        return;
      }
    }

    this.snake.unshift(newHead);

    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      this.eatFood();
    } else if (this.specialFood && newHead.x === this.specialFood.x && newHead.y === this.specialFood.y) {
      this.eatSpecialFood();
    } else {
      this.snake.pop();
    }
  }

  private eatFood(): void {
    this._score++;
    this.audio.coin();
    this.updateSpeed();
    this.checkObstacles();
    this.updateHighScore();

    if (!this.specialFood && Math.random() < 0.1) {
      this.spawnSpecialFood();
    }

    this.spawnFood();
  }

  private eatSpecialFood(): void {
    this._score += 5;
    this.audio.jump();
    this.specialFood = null;
    this.specialFoodTimer = 0;
    this.updateSpeed();
    this.checkObstacles();
    this.updateHighScore();
  }

  private updateSpeed(): void {
    this.moveInterval = Math.max(MIN_SPEED, BASE_SPEED * Math.pow(0.97, this._score));
  }

  private checkObstacles(): void {
    for (const threshold of OBSTACLE_THRESHOLDS) {
      if (this._score >= threshold && !this.obstacleThresholdsHit.includes(threshold)) {
        this.obstacleThresholdsHit.push(threshold);
        this.spawnObstacles(8 + Math.floor(Math.random() * 5));
      }
    }
  }

  private spawnObstacles(count: number): void {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < 200) {
      const x = Math.floor(Math.random() * GRID_WIDTH);
      const y = PLAY_TOP + Math.floor(Math.random() * (GRID_HEIGHT - PLAY_TOP));
      attempts++;

      if (this.isCellOccupied(x, y)) continue;
      if (TELEPORTERS.some(t =>
        (t.x1 === x && t.y1 === y) || (t.x2 === x && t.y2 === y)
      )) continue;

      this.obstacles.push({ x, y });
      placed++;
    }
  }

  private isCellOccupied(x: number, y: number): boolean {
    if (this.snake.some(s => s.x === x && s.y === y)) return true;
    if (this.obstacles.some(o => o.x === x && o.y === y)) return true;
    if (this.food && this.food.x === x && this.food.y === y) return true;
    if (this.specialFood && this.specialFood.x === x && this.specialFood.y === y) return true;
    return false;
  }

  private updateHighScore(): void {
    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }
  }

  private spawnFood(): void {
    let attempts = 0;
    do {
      this.food = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: PLAY_TOP + Math.floor(Math.random() * (GRID_HEIGHT - PLAY_TOP)),
      };
      attempts++;
    } while (attempts < 100 && this.isCellOccupied(this.food.x, this.food.y));
  }

  private spawnSpecialFood(): void {
    let attempts = 0;
    do {
      this.specialFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: PLAY_TOP + Math.floor(Math.random() * (GRID_HEIGHT - PLAY_TOP)),
      };
      attempts++;
    } while (attempts < 100 && this.isCellOccupied(this.specialFood.x, this.specialFood.y));
    this.specialFoodTimer = 3000;
  }

  private endGame(): void {
    this._gameOver = true;
    this.audio.explosion();
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    // Draw obstacles (striped blocks)
    for (const obs of this.obstacles) {
      const bx = obs.x * GRID_SIZE;
      const by = obs.y * GRID_SIZE;
      renderer.drawRect(bx, by, GRID_SIZE - 1, GRID_SIZE - 1, 3);
      renderer.drawRect(bx + 1, by + 1, GRID_SIZE - 3, GRID_SIZE - 3, 2);
      renderer.drawRect(bx + 2, by + 2, GRID_SIZE - 5, GRID_SIZE - 5, 3);
    }

    // Draw teleporters (animated)
    const tpFrame = Math.floor(this.animTimer * 4) % 2;
    for (const tp of TELEPORTERS) {
      const tpColor = tpFrame === 0 ? 1 : 2;
      renderer.drawRect(tp.x1 * GRID_SIZE, tp.y1 * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1, tpColor);
      renderer.drawRect(tp.x2 * GRID_SIZE, tp.y2 * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1, tpColor);
    }

    // Draw snake body (gradient: tail lighter)
    for (let i = this.snake.length - 1; i >= 1; i--) {
      const seg = this.snake[i];
      const fade = i / this.snake.length;
      const color = fade < 0.5 ? 1 : 2;
      renderer.drawRect(seg.x * GRID_SIZE, seg.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1, color);
    }

    // Draw snake head with eyes
    const head = this.snake[0];
    const hx = head.x * GRID_SIZE;
    const hy = head.y * GRID_SIZE;
    renderer.drawRect(hx, hy, GRID_SIZE - 1, GRID_SIZE - 1, 3);
    
    // Eyes based on direction
    if (this.direction.x === 1) { // Right
      renderer.drawRect(hx + 4, hy + 1, 2, 2, 0);
      renderer.drawRect(hx + 4, hy + 4, 2, 2, 0);
    } else if (this.direction.x === -1) { // Left
      renderer.drawRect(hx + 1, hy + 1, 2, 2, 0);
      renderer.drawRect(hx + 1, hy + 4, 2, 2, 0);
    } else if (this.direction.y === 1) { // Down
      renderer.drawRect(hx + 1, hy + 4, 2, 2, 0);
      renderer.drawRect(hx + 4, hy + 4, 2, 2, 0);
    } else if (this.direction.y === -1) { // Up
      renderer.drawRect(hx + 1, hy + 1, 2, 2, 0);
      renderer.drawRect(hx + 4, hy + 1, 2, 2, 0);
    }

    // Draw normal food (blinking, smaller square)
    const foodVisible = Math.floor(this.animTimer * 8) % 2 === 0;
    if (this.food && foodVisible) {
      renderer.drawRect(this.food.x * GRID_SIZE + 2, this.food.y * GRID_SIZE + 2, 4, 4, 3);
    }

    // Draw special food (golden, pulsing cross)
    if (this.specialFood) {
      const pulse = Math.floor(this.animTimer * 6) % 2;
      const sColor = pulse === 0 ? 1 : 2;
      const sx = this.specialFood.x * GRID_SIZE;
      const sy = this.specialFood.y * GRID_SIZE;
      renderer.drawRect(sx + 3, sy + 1, 2, 6, sColor);
      renderer.drawRect(sx + 1, sy + 3, 6, 2, sColor);
    }

    // HUD separator line
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);

    // HUD
    renderer.drawText(`SCORE:${this._score}`, 4, 4, 3);
    renderer.drawText(`HIGH:${this.highScore}`, 90, 4, 2);

    // Get-ready overlay
    if (this.readyTimer > 0) {
      renderer.drawTextCentered('GET READY', GAME_HEIGHT / 2 - 4, 3);
    }
  }

  getScore(): number {
    return this._score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  isGameOver(): boolean {
    return this._gameOver;
  }

  saveState(): object {
    return {
      snake: [...this.snake],
      direction: { ...this.direction },
      nextDirection: { ...this.nextDirection },
      food: this.food ? { ...this.food } : null,
      specialFood: this.specialFood ? { ...this.specialFood } : null,
      specialFoodTimer: this.specialFoodTimer,
      score: this._score,
      moveTimer: this.moveTimer,
      moveInterval: this.moveInterval,
      obstacles: [...this.obstacles],
      obstacleThresholdsHit: [...this.obstacleThresholdsHit],
    };
  }

  loadState(state: object): void {
    const s = state as Snake2SaveState;
    this.snake = [...s.snake];
    this.direction = { ...s.direction };
    this.nextDirection = { ...s.nextDirection };
    this.food = s.food ? { ...s.food } : null;
    this.specialFood = s.specialFood ? { ...s.specialFood } : null;
    this.specialFoodTimer = s.specialFoodTimer;
    this._score = s.score;
    this.moveTimer = s.moveTimer;
    this.moveInterval = s.moveInterval;
    this.obstacles = [...s.obstacles];
    this.obstacleThresholdsHit = [...s.obstacleThresholdsHit];
    this._gameOver = false;
  }
}
