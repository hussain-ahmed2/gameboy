/**
 * @file SnakeGame.ts
 * @description Classic Snake - eat food, grow, avoid walls and self.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState, SpriteFrame } from '@/lib/types';
import { Audio } from '@/engine/core';

const GRID_SIZE = 8;
const GRID_WIDTH = 160 / GRID_SIZE;  // 20
const GRID_HEIGHT = 144 / GRID_SIZE; // 18
const INITIAL_LENGTH = 3;
const BASE_SPEED = 150; // ms per move
const SPEED_INCREASE = 0.95; // 5% faster per food
const MIN_SPEED = 50;

interface Segment {
  x: number;
  y: number;
}

export class SnakeGame extends Game {
  private snake: Segment[] = [];
  private direction: { x: number; y: number } = { x: 1, y: 0 };
  private nextDirection: { x: number; y: number } = { x: 1, y: 0 };
  private food: { x: number; y: number } | null = null;
  private score = 0;
  private highScore = 0;
  private gameOver = false;
  private moveTimer = 0;
  private moveInterval = BASE_SPEED;
  private foodBlinkTimer = 0;
  private foodVisible = true;

  init(): void {
    this.highScore = SaveState.load('snake_highscore') as number || 0;
    
    // Initialize snake in center
    this.snake = [
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 8, y: 9 },
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.moveTimer = 0;
    this.moveInterval = BASE_SPEED;
    
    this.spawnFood();
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this.gameOver) {
      if (input.start && this.isJustPressed(input, 'start')) {
        this.init();
      }
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
    this.score++;
    Audio.prototype.coin.call(this.audio);
    
    // Increase speed
    this.moveInterval = Math.max(this.moveInterval * SPEED_INCREASE, MIN_SPEED);
    
    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      SaveState.save('snake_highscore', this.highScore);
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
    this.gameOver = true;
    Audio.prototype.explosion.call(this.audio);
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
    renderer.drawText(`SCORE: ${this.score}`, 4, 4, 3, 8);
    renderer.drawText(`HIGH: ${this.highScore}`, 90, 4, 2, 8);

    // Draw game over
    if (this.gameOver) {
      renderer.drawText('GAME OVER', 45, 60, 3, 12);
      renderer.drawText('PRESS START', 40, 76, 2, 8);
    }
  }

  private isJustPressed(input: GamePadState, button: keyof GamePadState): boolean {
    return input[button];
  }
}

// Import SaveState
import { SaveState } from '@/engine/core';