/**
 * @file BreakoutGame.ts
 * @description Classic Breakout game - break bricks with a bouncing ball.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState, ColorIndex } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const PADDLE_WIDTH = 24;
const PADDLE_HEIGHT = 4;
const PADDLE_Y = 132;
const PADDLE_SPEED = 80;

const BALL_SIZE = 4;
const BALL_BASE_SPEED = 60;
const MAX_BALL_SPEED = 120;
const BALL_SPEED_MULT = 1.05;

const BRICK_ROWS = 8;
const BRICK_COLS = 20;
const BRICK_WIDTH = 8;
const BRICK_HEIGHT = 4;
const BRICKS_Y_OFFSET = 8;

const INITIAL_LIVES = 3;

const HIGHSCORE_KEY = 'breakout_highscore';

interface Brick {
  x: number;
  y: number;
  colorIndex: ColorIndex;
  points: number;
  alive: boolean;
}

interface BreakoutSaveState {
  paddle: { x: number; y: number };
  ball: { x: number; y: number; vx: number; vy: number };
  bricks: Brick[];
  score: number;
  lives: number;
  level: number;
  ballSpeed: number;
  ballAttached: boolean;
}

export class BreakoutGame extends Game {
  readonly gameId = 'breakout';

  private paddle!: Sprite;
  private ball!: Sprite;
  private bricks: Brick[] = [];
  private _score = 0;
  private _lives = INITIAL_LIVES;
  private _level = 1;
  private ballSpeed = BALL_BASE_SPEED;
  private _gameOver = false;
  private ballAttached = true;
  private highScore = 0;

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this.paddle = new Sprite({
      x: (GAME_WIDTH - PADDLE_WIDTH) / 2,
      y: PADDLE_Y,
      frames: [{ x: 0, y: 0, w: PADDLE_WIDTH, h: PADDLE_HEIGHT, duration: 1000 }],
    });
    this.paddle.colorIndex = 3;

    this.ball = new Sprite({
      x: 0,
      y: 0,
      frames: [{ x: 0, y: 0, w: BALL_SIZE, h: BALL_SIZE, duration: 1000 }],
    });
    this.ball.colorIndex = 3;

    this._score = 0;
    this._lives = INITIAL_LIVES;
    this._level = 1;
    this.ballSpeed = BALL_BASE_SPEED;
    this._gameOver = false;
    this.ballAttached = true;

    this.generateBricks();
    this.attachBall();
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) return;

    if (input.left) {
      this.paddle.x -= PADDLE_SPEED * deltaTime;
    }
    if (input.right) {
      this.paddle.x += PADDLE_SPEED * deltaTime;
    }
    this.paddle.x = Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, this.paddle.x));

    if (this.ballAttached) {
      this.ball.x = this.paddle.x + (PADDLE_WIDTH - BALL_SIZE) / 2;
      this.ball.y = PADDLE_Y - BALL_SIZE;
      if (input.a) {
        this.launchBall();
      }
      return;
    }

    this.ball.x += this.ball.vx * deltaTime;
    this.ball.y += this.ball.vy * deltaTime;

    if (this.ball.y <= 0) {
      this.ball.y = 0;
      this.ball.vy = Math.abs(this.ball.vy);
      this.audio.beep();
    }

    if (this.ball.x <= 0) {
      this.ball.x = 0;
      this.ball.vx = Math.abs(this.ball.vx);
      this.audio.beep();
    } else if (this.ball.x >= GAME_WIDTH - BALL_SIZE) {
      this.ball.x = GAME_WIDTH - BALL_SIZE;
      this.ball.vx = -Math.abs(this.ball.vx);
      this.audio.beep();
    }

    if (this.ball.y + BALL_SIZE >= PADDLE_Y &&
        this.ball.y + BALL_SIZE <= PADDLE_Y + PADDLE_HEIGHT &&
        this.ball.x + BALL_SIZE > this.paddle.x &&
        this.ball.x < this.paddle.x + PADDLE_WIDTH &&
        this.ball.vy > 0) {
      this.ball.y = PADDLE_Y - BALL_SIZE;

      const hitPos = (this.ball.x + BALL_SIZE / 2) - (this.paddle.x + PADDLE_WIDTH / 2);
      const normalizedHit = hitPos / (PADDLE_WIDTH / 2);
      const maxAngle = Math.PI / 3;
      const angle = normalizedHit * maxAngle;

      this.ball.vx = Math.sin(angle) * this.ballSpeed;
      this.ball.vy = -Math.cos(angle) * this.ballSpeed;

      this.audio.beep();
    }

    for (const brick of this.bricks) {
      if (!brick.alive) continue;

      if (this.ball.x + BALL_SIZE > brick.x &&
          this.ball.x < brick.x + BRICK_WIDTH &&
          this.ball.y + BALL_SIZE > brick.y &&
          this.ball.y < brick.y + BRICK_HEIGHT) {

        brick.alive = false;
        this._score += brick.points;
        this.audio.boop();

        const overlapLeft = (this.ball.x + BALL_SIZE) - brick.x;
        const overlapRight = (brick.x + BRICK_WIDTH) - this.ball.x;
        const overlapTop = (this.ball.y + BALL_SIZE) - brick.y;
        const overlapBottom = (brick.y + BRICK_HEIGHT) - this.ball.y;
        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
          this.ball.vx = -this.ball.vx;
        } else {
          this.ball.vy = -this.ball.vy;
        }

        this.ballSpeed = Math.min(this.ballSpeed * BALL_SPEED_MULT, MAX_BALL_SPEED);
        const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        if (speed > 0) {
          this.ball.vx = (this.ball.vx / speed) * this.ballSpeed;
          this.ball.vy = (this.ball.vy / speed) * this.ballSpeed;
        }

        break;
      }
    }

    if (this.ball.y > GAME_HEIGHT) {
      this.loseLife();
    }

    if (this.bricks.every(b => !b.alive)) {
      this.nextLevel();
    }

    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    for (const brick of this.bricks) {
      if (brick.alive) {
        renderer.drawRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, brick.colorIndex);
      }
    }

    this.paddle.draw(renderer);
    this.ball.draw(renderer);

    // HUD separator
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);

    for (let i = 0; i < this._lives; i++) {
      renderer.drawRect(4 + i * 6, 4, 4, 4, 3);
    }

    renderer.drawText(`${this._score}`, GAME_WIDTH - 30, 4, 3);
    renderer.drawText(`L${this._level}`, 80, 4, 2);
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
      paddle: { x: this.paddle.x, y: this.paddle.y },
      ball: { x: this.ball.x, y: this.ball.y, vx: this.ball.vx, vy: this.ball.vy },
      bricks: this.bricks.map(b => ({ ...b })),
      score: this._score,
      lives: this._lives,
      level: this._level,
      ballSpeed: this.ballSpeed,
      ballAttached: this.ballAttached,
    };
  }

  loadState(state: object): void {
    const s = state as BreakoutSaveState;
    this.paddle.x = s.paddle.x;
    this.paddle.y = s.paddle.y;
    this.ball.x = s.ball.x;
    this.ball.y = s.ball.y;
    this.ball.vx = s.ball.vx;
    this.ball.vy = s.ball.vy;
    this.bricks = s.bricks.map(b => ({ ...b }));
    this._score = s.score;
    this._lives = s.lives;
    this._level = s.level;
    this.ballSpeed = s.ballSpeed;
    this.ballAttached = s.ballAttached;
    this._gameOver = false;
  }

  private generateBricks(): void {
    this.bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        this.bricks.push({
          x: col * BRICK_WIDTH,
          y: BRICKS_Y_OFFSET + row * BRICK_HEIGHT,
          colorIndex: Math.max(1, 3 - Math.floor(row / 2)) as ColorIndex,
          points: BRICK_ROWS - row,
          alive: true,
        });
      }
    }
  }

  private attachBall(): void {
    this.ballAttached = true;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = this.paddle.x + (PADDLE_WIDTH - BALL_SIZE) / 2;
    this.ball.y = PADDLE_Y - BALL_SIZE;
  }

  private launchBall(): void {
    this.ballAttached = false;
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    this.ball.vx = Math.sin(angle) * this.ballSpeed;
    this.ball.vy = -Math.cos(angle) * this.ballSpeed;
  }

  private loseLife(): void {
    this._lives--;
    this.audio.explosion();
    if (this._lives <= 0) {
      this._gameOver = true;
    } else {
      this.ballSpeed = Math.max(BALL_BASE_SPEED, this.ballSpeed * 0.8);
      this.attachBall();
    }
  }

  private nextLevel(): void {
    this._level++;
    this.ballSpeed = Math.min(this.ballSpeed * 1.1, MAX_BALL_SPEED);
    this.audio.coin();
    this.generateBricks();
    this.attachBall();
  }
}
