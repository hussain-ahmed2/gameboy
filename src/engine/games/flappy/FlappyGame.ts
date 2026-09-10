/**
 * @file FlappyGame.ts
 * @description Flappy Bird clone - tap to flap, avoid pipes, score points.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const BIRD_X = 40;
const BIRD_SIZE = 8;
const GRAVITY = 300;
const FLAP_VELOCITY = -120;
const TERMINAL_VELOCITY = 200;
const PIPE_WIDTH = 16;
const PIPE_GAP = 40;
const PIPE_SPEED = 60;
const PIPE_SPACING = 200;
const GROUND_HEIGHT = 16;
const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;

const HIGHSCORE_KEY = 'flappy_highscore';

interface Pipe {
  x: number;
  gapY: number;
  scored: boolean;
}

interface FlappySaveState {
  birdY: number;
  birdVy: number;
  birdRotation: number;
  pipes: Pipe[];
  pipeTimer: number;
  score: number;
  groundScroll: number;
}

export class FlappyGame extends Game {
  readonly gameId = 'flappy';

  private birdY = 0;
  private birdVy = 0;
  private birdRotation = 0;
  private bird!: Sprite;
  private pipes: Pipe[] = [];
  private pipeTimer = 0;
  private _score = 0;
  private highScore = 0;
  private _gameOver = false;
  private groundScroll = 0;
  private flapPressed = false;
  private lastFlapState = false;
  private flashTimer = 0;

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this.bird = new Sprite({
      x: BIRD_X,
      y: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
      frames: [{ x: 0, y: 0, w: BIRD_SIZE, h: BIRD_SIZE, duration: 1000 }],
    });
    this.bird.colorIndex = 3;

    this.birdY = this.bird.y;
    this.birdVy = 0;
    this.birdRotation = 0;
    this.pipes = [];
    this.pipeTimer = PIPE_SPACING;
    this._score = 0;
    this._gameOver = false;
    this.groundScroll = 0;
    this.flashTimer = 0;
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) {
      return;
    }

    // Flap detection (rising edge)
    const aPressed = input.a || input.up;
    if (aPressed && !this.lastFlapState) {
      this.flap();
    }
    this.lastFlapState = aPressed;

    // Apply gravity
    this.birdVy += GRAVITY * deltaTime;
    if (this.birdVy > TERMINAL_VELOCITY) {
      this.birdVy = TERMINAL_VELOCITY;
    }

    // Update bird position
    this.birdY += this.birdVy * deltaTime;
    this.bird.y = this.birdY;

    // Bird rotation (visual only)
    if (this.birdVy < 0) {
      this.birdRotation = -1;
    } else if (this.birdVy > 100) {
      this.birdRotation = 1;
    } else {
      this.birdRotation = 0;
    }

    // Scroll ground
    this.groundScroll = (this.groundScroll + PIPE_SPEED * deltaTime) % 8;

    // Spawn pipes
    this.pipeTimer += PIPE_SPEED * deltaTime;
    if (this.pipeTimer >= PIPE_SPACING) {
      this.pipeTimer -= PIPE_SPACING;
      this.spawnPipe();
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= PIPE_SPEED * deltaTime;

      // Score check
      if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.scored = true;
        this._score++;
        this.audio.coin();
      }

      // Remove off-screen pipes
      if (pipe.x + PIPE_WIDTH < 0) {
        this.pipes.splice(i, 1);
      }
    }

    // Collision detection
    if (this.checkCollision()) {
      this.endGame();
    }

    // Flash effect on death
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }
  }

  private flap(): void {
    this.birdVy = FLAP_VELOCITY;
    this.audio.jump();
  }

  private spawnPipe(): void {
    const gapY = HUD_HEIGHT + 10 + Math.random() * 50;
    this.pipes.push({ x: GAME_WIDTH, gapY, scored: false });
  }

  private checkCollision(): boolean {
    // Ground collision
    if (this.birdY + BIRD_SIZE >= GROUND_Y) {
      this.birdY = GROUND_Y - BIRD_SIZE;
      return true;
    }

    // Ceiling collision (respect HUD boundary)
    if (this.birdY < HUD_HEIGHT) {
      this.birdY = HUD_HEIGHT;
      return true;
    }

    // Pipe collision
    for (const pipe of this.pipes) {
      const birdRight = BIRD_X + BIRD_SIZE;
      const birdBottom = this.birdY + BIRD_SIZE;

      // Check horizontal overlap
      if (birdRight > pipe.x && BIRD_X < pipe.x + PIPE_WIDTH) {
        // Check if bird is in the gap
        if (this.birdY < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
          return true;
        }
      }
    }

    return false;
  }

  private endGame(): void {
    this._gameOver = true;
    this.flashTimer = 0.2;
    this.audio.explosion();

    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    // Draw pipes
    for (const pipe of this.pipes) {
      // Top pipe
      renderer.drawRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY, 2);
      // Bottom pipe
      renderer.drawRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, GROUND_Y - pipe.gapY - PIPE_GAP, 2);
    }

    // Draw ground
    renderer.drawRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT, 2);
    // Ground detail (scrolling strip)
    for (let x = -8; x < GAME_WIDTH + 8; x += 8) {
      const drawX = x - this.groundScroll;
      renderer.drawRect(drawX, GROUND_Y, 4, 2, 1);
    }

    // Draw bird with rotation effect (visual width/height change)
    if (this.flashTimer <= 0 || Math.floor(this.flashTimer * 10) % 2 === 0) {
      const w = BIRD_SIZE + (this.birdRotation === -1 ? 1 : 0);
      const h = BIRD_SIZE + (this.birdRotation === 1 ? 1 : 0);
      renderer.drawRect(BIRD_X, this.birdY, w, h, 3);
    }

    // HUD separator
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);

    // Draw score
    renderer.drawText(`${this._score}`, GAME_WIDTH / 2 - 4, 4, 3);

    // Game over overlay
    if (this._gameOver) {
      renderer.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 0);
      renderer.drawText('GAME OVER', 40, 52, 3);
      renderer.drawText(`SCORE: ${this._score}`, 44, 68, 2);
      renderer.drawText(`HIGH: ${this.highScore}`, 44, 80, 2);
      renderer.drawText('PRESS A', 48, 100, 3);
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
      birdY: this.birdY,
      birdVy: this.birdVy,
      birdRotation: this.birdRotation,
      pipes: this.pipes.map(p => ({ ...p })),
      pipeTimer: this.pipeTimer,
      score: this._score,
      groundScroll: this.groundScroll,
    };
  }

  loadState(state: object): void {
    const s = state as FlappySaveState;
    this.birdY = s.birdY;
    this.birdVy = s.birdVy;
    this.birdRotation = s.birdRotation;
    this.pipes = s.pipes.map(p => ({ ...p }));
    this.pipeTimer = s.pipeTimer;
    this._score = s.score;
    this.groundScroll = s.groundScroll;
    this._gameOver = false;
    this.bird.y = this.birdY;
  }
}
