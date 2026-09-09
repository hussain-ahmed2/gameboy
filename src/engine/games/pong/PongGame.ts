/**
 * @file PongGame.ts
 * @description Classic Pong game - two paddles, one ball, score to 11.
 */

import { Game, Sprite, TileMap } from '@/engine/api';
import type { Renderer, GamePadState, SpriteFrame } from '@/lib/types';
import { Input } from '@/engine/core';
import { Audio } from '@/engine/core';

const PADDLE_WIDTH = 4;
const PADDLE_HEIGHT = 24;
const BALL_SIZE = 4;
const PADDLE_SPEED = 80;
const BALL_BASE_SPEED = 50;
const MAX_BALL_SPEED = 120;
const WIN_SCORE = 11;

export class PongGame extends Game {
  private playerPaddle!: Sprite;
  private aiPaddle!: Sprite;
  private ball!: Sprite;
  private playerScore = 0;
  private aiScore = 0;
  private ballSpeed = BALL_BASE_SPEED;
  private gameOver = false;
  private winner: 'player' | 'ai' | null = null;
  private flashTimer = 0;
  private flashVisible = true;

  init(): void {
    // Create player paddle (left)
    this.playerPaddle = new Sprite({
      x: 8,
      y: (144 - PADDLE_HEIGHT) / 2,
      frames: [{ x: 0, y: 0, w: PADDLE_WIDTH, h: PADDLE_HEIGHT, duration: 1000 }],
    });
    this.playerPaddle.colorIndex = 3;

    // Create AI paddle (right)
    this.aiPaddle = new Sprite({
      x: 160 - 8 - PADDLE_WIDTH,
      y: (144 - PADDLE_HEIGHT) / 2,
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
    this.gameOver = false;
    this.winner = null;
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this.gameOver) {
      if (input.start && this.isJustPressed(input, 'start')) {
        this.init();
      }
      return;
    }

    // Player paddle movement
    if (input.up && this.playerPaddle.y > 0) {
      this.playerPaddle.y -= PADDLE_SPEED * deltaTime;
    }
    if (input.down && this.playerPaddle.y < 144 - PADDLE_HEIGHT) {
      this.playerPaddle.y += PADDLE_SPEED * deltaTime;
    }

    // AI paddle movement (tracks ball with delay)
    const aiCenter = this.aiPaddle.y + PADDLE_HEIGHT / 2;
    const ballCenter = this.ball.y + BALL_SIZE / 2;
    const aiDiff = ballCenter - aiCenter;
    
    if (Math.abs(aiDiff) > 4) {
      const aiSpeed = PADDLE_SPEED * 0.7; // Slightly slower than player
      if (aiDiff > 0 && this.aiPaddle.y < 144 - PADDLE_HEIGHT) {
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
      Audio.prototype.beep.call(this.audio);
    } else if (this.ball.y >= 144 - BALL_SIZE) {
      this.ball.y = 144 - BALL_SIZE;
      this.ball.vy = -Math.abs(this.ball.vy);
      Audio.prototype.beep.call(this.audio);
    }

    // Ball collision with player paddle
    if (this.ball.collidesWith(this.playerPaddle)) {
      this.ball.x = this.playerPaddle.x + PADDLE_WIDTH;
      this.ball.vx = Math.abs(this.ball.vx);
      
      // Angle based on hit position
      const hitPos = (this.ball.y + BALL_SIZE / 2) - (this.playerPaddle.y + PADDLE_HEIGHT / 2);
      this.ball.vy = (hitPos / (PADDLE_HEIGHT / 2)) * this.ballSpeed * 0.8;
      
      this.increaseBallSpeed();
      Audio.prototype.beep.call(this.audio);
    }

    // Ball collision with AI paddle
    if (this.ball.collidesWith(this.aiPaddle)) {
      this.ball.x = this.aiPaddle.x - BALL_SIZE;
      this.ball.vx = -Math.abs(this.ball.vx);
      
      const hitPos = (this.ball.y + BALL_SIZE / 2) - (this.aiPaddle.y + PADDLE_HEIGHT / 2);
      this.ball.vy = (hitPos / (PADDLE_HEIGHT / 2)) * this.ballSpeed * 0.8;
      
      this.increaseBallSpeed();
      Audio.prototype.beep.call(this.audio);
    }

    // Score check
    if (this.ball.x < 0) {
      this.aiScore++;
      this.checkWin();
      if (!this.gameOver) this.resetBall();
      Audio.prototype.boop.call(this.audio);
    } else if (this.ball.x > 160) {
      this.playerScore++;
      this.checkWin();
      if (!this.gameOver) this.resetBall();
      Audio.prototype.boop.call(this.audio);
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
    for (let y = 0; y < 144; y += 8) {
      renderer.drawRect(79, y, 2, 4, 2);
    }

    // Draw paddles and ball (flash on score)
    if (this.flashTimer <= 0 || this.flashVisible) {
      this.playerPaddle.draw(renderer);
      this.aiPaddle.draw(renderer);
      this.ball.draw(renderer);
    }

    // Draw scores
    renderer.drawText(`${this.playerScore}`, 30, 8, 3, 16);
    renderer.drawText(`${this.aiScore}`, 120, 8, 3, 16);

    // Draw game over message
    if (this.gameOver) {
      const msg = this.winner === 'player' ? 'PLAYER WINS!' : 'AI WINS!';
      renderer.drawText(msg, 35, 64, 3, 12);
      renderer.drawText('PRESS START', 40, 80, 2, 8);
    }
  }

  private resetBall(): void {
    this.ball.x = 80;
    this.ball.y = 72;
    this.ballSpeed = BALL_BASE_SPEED;
    
    // Random initial direction
    const angle = (Math.random() - 0.5) * Math.PI / 2; // -45 to 45 degrees
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
      this.gameOver = true;
      this.winner = 'player';
    } else if (this.aiScore >= WIN_SCORE) {
      this.gameOver = true;
      this.winner = 'ai';
    }
    if (this.gameOver) {
      this.flashTimer = 0.5;
      this.flashVisible = true;
    }
  }

  // Helper for edge detection (since we don't have previous input in this scope)
  private isJustPressed(input: GamePadState, button: keyof GamePadState): boolean {
    // Simplified - just check if pressed (for game over restart)
    return input[button];
  }
}