/**
 * @file PongGame.ts
 * @description Classic Pong game - two paddles, one ball, score to 11.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const PADDLE_WIDTH = 4;
const PADDLE_HEIGHT = 24;
const BALL_SIZE = 4;
const PADDLE_SPEED = 80;
const BALL_BASE_SPEED = 50;
const MAX_BALL_SPEED = 120;
const WIN_SCORE = 11;

const HIGHSCORE_KEY = 'pong_highscore';

interface PongSaveState {
  playerPaddle: { x: number; y: number };
  aiPaddle: { x: number; y: number };
  ball: { x: number; y: number; vx: number; vy: number };
  playerScore: number;
  aiScore: number;
  ballSpeed: number;
}

export class PongGame extends Game {
  readonly gameId = 'pong';

  private playerPaddle!: Sprite;
  private aiPaddle!: Sprite;
  private ball!: Sprite;
  private playerScore = 0;
  private aiScore = 0;
  private ballSpeed = BALL_BASE_SPEED;
  private _gameOver = false;
  private winner: 'player' | 'ai' | null = null;
  private flashTimer = 0;
  private flashVisible = true;
  private highScore = 0;

  init(): void {
    // Load high score
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    // Create player paddle (left)
    this.playerPaddle = new Sprite({
      x: 8,
      y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
      frames: [{ x: 0, y: 0, w: PADDLE_WIDTH, h: PADDLE_HEIGHT, duration: 1000 }],
    });
    this.playerPaddle.colorIndex = 3;

    // Create AI paddle (right)
    this.aiPaddle = new Sprite({
      x: GAME_WIDTH - 8 - PADDLE_WIDTH,
      y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
      frames: [{ x: 0, y: 0, w: PADDLE_WIDTH, h: PADDLE_HEIGHT, duration: 1000 }],
    });
    this.aiPaddle.colorIndex = 3;

    // Create ball
    this.ball = new Sprite({
      x: 80,
      y: 72,
      frames: [{ x: 0, y: 0, w: BALL_SIZE, h: BALL_SIZE, duration: 1000 }],
    });
    this.ball.colorIndex = 3;
    this.resetBall();

    this.playerScore = 0;
    this.aiScore = 0;
    this.ballSpeed = BALL_BASE_SPEED;
    this._gameOver = false;
    this.winner = null;
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) {
      return;
    }

    // Player paddle movement
    if (input.up && this.playerPaddle.y > 0) {
      this.playerPaddle.y -= PADDLE_SPEED * deltaTime;
    }
    if (input.down && this.playerPaddle.y < GAME_HEIGHT - PADDLE_HEIGHT) {
      this.playerPaddle.y += PADDLE_SPEED * deltaTime;
    }

    // AI paddle movement (tracks ball with delay)
    const aiCenter = this.aiPaddle.y + PADDLE_HEIGHT / 2;
    const ballCenter = this.ball.y + BALL_SIZE / 2;
    const aiDiff = ballCenter - aiCenter;
    
    if (Math.abs(aiDiff) > 4) {
      const aiSpeed = PADDLE_SPEED * 0.7;
      if (aiDiff > 0 && this.aiPaddle.y < GAME_HEIGHT - PADDLE_HEIGHT) {
        this.aiPaddle.y += Math.min(aiSpeed * deltaTime, aiDiff);
      } else if (aiDiff < 0 && this.aiPaddle.y > 0) {
        this.aiPaddle.y += Math.max(-aiSpeed * deltaTime, aiDiff);
      }
    }

    // Ball movement
    this.ball.x += this.ball.vx * deltaTime;
    this.ball.y += this.ball.vy * deltaTime;

    // Ball collision with top/bottom walls
    if (this.ball.y <= 0) {
      this.ball.y = 0;
      this.ball.vy = Math.abs(this.ball.vy);
      this.audio.beep();
    } else if (this.ball.y >= GAME_HEIGHT - BALL_SIZE) {
      this.ball.y = GAME_HEIGHT - BALL_SIZE;
      this.ball.vy = -Math.abs(this.ball.vy);
      this.audio.beep();
    }

    // Ball collision with player paddle
    if (this.ball.collidesWith(this.playerPaddle)) {
      this.ball.x = this.playerPaddle.x + PADDLE_WIDTH;
      this.ball.vx = Math.abs(this.ball.vx);
      
      const hitPos = (this.ball.y + BALL_SIZE / 2) - (this.playerPaddle.y + PADDLE_HEIGHT / 2);
      this.ball.vy = (hitPos / (PADDLE_HEIGHT / 2)) * this.ballSpeed * 0.8;
      
      this.increaseBallSpeed();
      this.audio.beep();
    }

    // Ball collision with AI paddle
    if (this.ball.collidesWith(this.aiPaddle)) {
      this.ball.x = this.aiPaddle.x - BALL_SIZE;
      this.ball.vx = -Math.abs(this.ball.vx);
      
      const hitPos = (this.ball.y + BALL_SIZE / 2) - (this.aiPaddle.y + PADDLE_HEIGHT / 2);
      this.ball.vy = (hitPos / (PADDLE_HEIGHT / 2)) * this.ballSpeed * 0.8;
      
      this.increaseBallSpeed();
      this.audio.beep();
    }

    // Score check
    if (this.ball.x < 0) {
      this.aiScore++;
      this.checkWin();
      if (!this._gameOver) this.resetBall();
      this.audio.boop();
    } else if (this.ball.x > GAME_WIDTH) {
      this.playerScore++;
      this.checkWin();
      if (!this._gameOver) this.resetBall();
      this.audio.boop();
    }

    // Flash effect on score
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
      this.flashVisible = Math.floor(this.flashTimer * 10) % 2 === 0;
    }
  }

  draw(renderer: Renderer): void {
    // Clear with color 0 (lightest)
    renderer.clear(0);

    // Draw center line
    for (let y = 0; y < GAME_HEIGHT; y += 8) {
      renderer.drawRect(79, y, 2, 4, 2);
    }

    // Draw paddles and ball (flash on score)
    if (this.flashTimer <= 0 || this.flashVisible) {
      this.playerPaddle.draw(renderer);
      this.aiPaddle.draw(renderer);
      this.ball.draw(renderer);
    }

    // HUD separator
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);

    // Draw scores
    renderer.drawText(`${this.playerScore}`, 60, 4, 3);
    renderer.drawText(`${this.aiScore}`, 90, 4, 3);
  }

  getScore(): number {
    return this.playerScore;
  }

  getHighScore(): number {
    return Math.max(this.highScore, this.playerScore);
  }

  isGameOver(): boolean {
    return this._gameOver;
  }

  saveState(): object {
    return {
      playerPaddle: { x: this.playerPaddle.x, y: this.playerPaddle.y },
      aiPaddle: { x: this.aiPaddle.x, y: this.aiPaddle.y },
      ball: { x: this.ball.x, y: this.ball.y, vx: this.ball.vx, vy: this.ball.vy },
      playerScore: this.playerScore,
      aiScore: this.aiScore,
      ballSpeed: this.ballSpeed,
    };
  }

  loadState(state: object): void {
    const s = state as PongSaveState;
    this.playerPaddle.x = s.playerPaddle.x;
    this.playerPaddle.y = s.playerPaddle.y;
    this.aiPaddle.x = s.aiPaddle.x;
    this.aiPaddle.y = s.aiPaddle.y;
    this.ball.x = s.ball.x;
    this.ball.y = s.ball.y;
    this.ball.vx = s.ball.vx;
    this.ball.vy = s.ball.vy;
    this.playerScore = s.playerScore;
    this.aiScore = s.aiScore;
    this.ballSpeed = s.ballSpeed;
    this._gameOver = false;
    this.winner = null;
  }

  private resetBall(): void {
    this.ball.x = 80;
    this.ball.y = 72;
    this.ballSpeed = BALL_BASE_SPEED;
    
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.ball.vx = Math.cos(angle) * this.ballSpeed * direction;
    this.ball.vy = Math.sin(angle) * this.ballSpeed;
  }

  private increaseBallSpeed(): void {
    this.ballSpeed = Math.min(this.ballSpeed * 1.05, MAX_BALL_SPEED);
    const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
    if (speed > 0) {
      this.ball.vx = (this.ball.vx / speed) * this.ballSpeed;
      this.ball.vy = (this.ball.vy / speed) * this.ballSpeed;
    }
  }

  private checkWin(): void {
    if (this.playerScore >= WIN_SCORE) {
      this._gameOver = true;
      this.winner = 'player';
      if (this.playerScore > this.highScore) {
        this.highScore = this.playerScore;
        SaveState.save(HIGHSCORE_KEY, this.highScore);
      }
    } else if (this.aiScore >= WIN_SCORE) {
      this._gameOver = true;
      this.winner = 'ai';
    }
    if (this._gameOver) {
      this.flashTimer = 0.5;
      this.flashVisible = true;
    }
  }
}
