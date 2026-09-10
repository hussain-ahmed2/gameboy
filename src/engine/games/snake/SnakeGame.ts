/**
 * @file SnakeGame.ts
 * @description Classic Snake - eat food, grow, avoid walls and self.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { Audio, SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/constants';

const GRID_SIZE = 8;
const GRID_WIDTH = GAME_WIDTH / GRID_SIZE;
const GRID_HEIGHT = GAME_HEIGHT / GRID_SIZE;
const BASE_SPEED = 150; // ms per move
const SPEED_INCREASE = 0.95; // 5% faster per food
const MIN_SPEED = 50;

const HIGHSCORE_KEY = 'snake_highscore';

interface Segment {
  x: number;
  y: number;
}

interface SnakeSaveState {
  snake: Segment[];
  direction: { x: number; y: number };
  nextDirection: { x: number; y: number };
  food: { x: number; y: number } | null;
  score: number;
  moveTimer: number;
  moveInterval: number;
}

export class SnakeGame extends Game {
  readonly gameId = 'snake';

  private snake: Segment[] = [];
  private direction: { x: number; y: number } = { x: 1, y: 0 };
  private nextDirection: { x: number; y: number } = { x: 1, y: 0 };
  private food: { x: number; y: number } | null = null;
  private _score = 0;
  private highScore = 0;
  private _gameOver = false;
  private moveTimer = 0;
  private moveInterval = BASE_SPEED;
  private foodBlinkTimer = 0;
  private foodVisible = true;

  init(): void {
    // Load high score
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }
    
    // Initialize snake in center
    this.snake = [
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 8, y: 9 },
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this._score = 0;
    this._gameOver = false;
    this.moveTimer = 0;
    this.moveInterval = BASE_SPEED;
    
    this.spawnFood();
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) {
      return;
    }

    // Handle direction input (queue to prevent 180° turns)
    if (input.up && this.direction.y !== 1) {
      this.nextDirection = { x: 0, y: -1 };
    } else if (input.down && this.direction.y !== -1) {
      this.nextDirection = { x: 0, y: 1 };
    } else if (input.left && this.direction.x !== 1) {
      this.nextDirection = { x: -1, y: 0 };
    } else if (input.right && this.direction.x !== -1) {
      this.nextDirection = { x: 1, y: 0 };
    }

    // Move timer
    this.moveTimer += deltaTime * 1000;
    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0;
      this.moveSnake();
    }

    // Food blink animation
    this.foodBlinkTimer += deltaTime;
    this.foodVisible = Math.floor(this.foodBlinkTimer * 8) % 2 === 0;
  }

  private moveSnake(): void {
    this.direction = { ...this.nextDirection };

    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= GRID_WIDTH || newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
      this.endGame();
      return;
    }

    // Self collision
    for (const segment of this.snake) {
      if (segment.x === newHead.x && segment.y === newHead.y) {
        this.endGame();
        return;
      }
    }

    // Add new head
    this.snake.unshift(newHead);

    // Check food
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      this.eatFood();
    } else {
      // Remove tail
      this.snake.pop();
    }
  }

  private eatFood(): void {
    this._score++;
    this.audio.coin();
    
    // Increase speed
    this.moveInterval = Math.max(this.moveInterval * SPEED_INCREASE, MIN_SPEED);
    
    // Update high score
    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }
    
    this.spawnFood();
  }

  private spawnFood(): void {
    let attempts = 0;
    do {
      this.food = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      };
      attempts++;
    } while (attempts < 100 && this.snake.some(s => s.x === this.food!.x && s.y === this.food!.y));
  }

  private endGame(): void {
    this._gameOver = true;
    this.audio.explosion();
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    // Draw snake
    this.snake.forEach((segment, i) => {
      const colorIndex = i === 0 ? 3 : 2; // Head darker
      renderer.drawRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1,
        colorIndex
      );
    });

    // Draw food (blinking)
    if (this.food && this.foodVisible) {
      renderer.drawRect(
        this.food.x * GRID_SIZE,
        this.food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1,
        3
      );
    }

    // Draw score
    renderer.drawText(`SCORE:${this._score}`, 4, 4, 3);
    renderer.drawText(`HIGH:${this.highScore}`, 90, 4, 2);
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
      score: this._score,
      moveTimer: this.moveTimer,
      moveInterval: this.moveInterval,
    };
  }

  loadState(state: object): void {
    const s = state as SnakeSaveState;
    this.snake = [...s.snake];
    this.direction = { ...s.direction };
    this.nextDirection = { ...s.nextDirection };
    this.food = s.food ? { ...s.food } : null;
    this._score = s.score;
    this.moveTimer = s.moveTimer;
    this.moveInterval = s.moveInterval;
    this._gameOver = false;
  }
}
