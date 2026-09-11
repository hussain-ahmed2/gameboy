/**
 * @file FlappyGame.ts
 * @description Flappy Bird clone - tap to flap, avoid pipes, score points.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const BIRD_X = 36;
const BIRD_SIZE = 8;
const GRAVITY = 320;
const FLAP_VELOCITY = -95;
const TERMINAL_VELOCITY = 160;
const PIPE_WIDTH = 16;
const PIPE_GAP = 42;
const PIPE_SPEED = 55;
const PIPE_SPACING = 96;
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
  lastFlapState: boolean;
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
  private waitingForStart = true;  // tap-to-start state
  private hoverTimer = 0;          // drives the idle bob animation

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
    this.waitingForStart = true;
    this.hoverTimer = 0;
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) {
      return;
    }

    // ── Tap-to-start: bird hovers until first A press ──
    if (this.waitingForStart) {
      this.hoverTimer += deltaTime;
      // Gentle sine-wave bob
      this.birdY = GAME_HEIGHT / 2 - BIRD_SIZE / 2 + Math.sin(this.hoverTimer * 3) * 3;
      this.bird.y = this.birdY;
      this.birdVy = 0;
      // Scroll ground for visual interest
      this.groundScroll = (this.groundScroll + PIPE_SPEED * deltaTime) % 8;

      const aPressed = input.a || input.up;
      if (aPressed && !this.lastFlapState) {
        this.waitingForStart = false;
        this.flap(); // first flap launches the bird
      }
      this.lastFlapState = aPressed;
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
    } else if (this.birdVy > 80) {
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
      if (pipe.x + PIPE_WIDTH + 4 < 0) {
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
    const minGapY = HUD_HEIGHT + 16;
    const maxGapY = GROUND_Y - PIPE_GAP - 16;
    const gapY = minGapY + Math.floor(Math.random() * (maxGapY - minGapY + 1));
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

    // Pipe collision with 1px forgiving hitbox for authentic feel
    for (const pipe of this.pipes) {
      const birdLeft = BIRD_X + 1;
      const birdRight = BIRD_X + BIRD_SIZE - 1;
      const birdTop = this.birdY + 1;
      const birdBottom = this.birdY + BIRD_SIZE - 1;

      // Check horizontal overlap with pipe body (and collar)
      if (birdRight > pipe.x - 1 && birdLeft < pipe.x + PIPE_WIDTH + 1) {
        // Check if bird is in the gap
        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
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

    // Draw pipes with classic 3D collars and highlights
    for (const pipe of this.pipes) {
      const px = Math.floor(pipe.x);
      const gy = Math.floor(pipe.gapY);

      // Top pipe body
      renderer.drawRect(px, HUD_HEIGHT, PIPE_WIDTH, gy - HUD_HEIGHT, 2);
      // Top pipe highlight (left streak)
      renderer.drawRect(px + 2, HUD_HEIGHT, 2, gy - HUD_HEIGHT, 1);
      // Top pipe collar / lip at bottom
      renderer.drawRect(px - 1, gy - 4, PIPE_WIDTH + 2, 4, 3);
      renderer.drawRect(px + 1, gy - 3, 2, 2, 1);

      // Bottom pipe body
      renderer.drawRect(px, gy + PIPE_GAP, PIPE_WIDTH, GROUND_Y - gy - PIPE_GAP, 2);
      // Bottom pipe highlight
      renderer.drawRect(px + 2, gy + PIPE_GAP, 2, GROUND_Y - gy - PIPE_GAP, 1);
      // Bottom pipe collar / lip at top
      renderer.drawRect(px - 1, gy + PIPE_GAP, PIPE_WIDTH + 2, 4, 3);
      renderer.drawRect(px + 1, gy + PIPE_GAP + 1, 2, 2, 1);
    }

    // Draw ground
    renderer.drawRect(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT, 2);
    // Ground detail (scrolling strip)
    const scrollOffset = Math.floor(this.groundScroll);
    for (let x = -8; x < GAME_WIDTH + 8; x += 8) {
      const drawX = x - scrollOffset;
      renderer.drawRect(drawX, GROUND_Y, 4, 2, 1);
    }

    // Draw side-view bird: round pea body, pointy beak, tail feathers, animated wing
    if (this.flashTimer <= 0 || Math.floor(this.flashTimer * 10) % 2 === 0) {
      const bx = Math.floor(BIRD_X);
      const by = Math.floor(this.birdY);
      const flapping = this.birdVy < 0;

      // ── Tail feathers (left side, color 2) ──
      // Two forked feathers pointing left
      renderer.drawRect(bx,     by + 2, 2, 1, 2); // upper tail feather
      renderer.drawRect(bx,     by + 4, 2, 1, 2); // lower tail feather

      // ── Body (pea / round shape, color 3 darkest) ──
      renderer.drawRect(bx + 2, by + 1, 4, 1, 3); // top arc
      renderer.drawRect(bx + 1, by + 2, 5, 4, 3); // wide mid (rows 2-5)
      renderer.drawRect(bx + 2, by + 6, 4, 1, 3); // bottom arc

      // ── Eye (white, upper-right of body — the "face" side) ──
      renderer.drawRect(bx + 4, by + 2, 2, 2, 0); // eye white
      renderer.drawRect(bx + 5, by + 3, 1, 1, 3); // pupil

      // ── Beak (pointy, color 2, pointing right) ──
      renderer.drawRect(bx + 6, by + 3, 2, 1, 2); // upper beak plate (2px wide)
      renderer.drawRect(bx + 6, by + 4, 1, 1, 2); // lower beak tip  (1px = point)

      // ── Wing (color 1, animates up when flapping / tucked mid-body when falling) ──
      if (flapping) {
        // Wing raised — drawn above body
        renderer.drawRect(bx + 2, by,     3, 1, 1);
      } else {
        // Wing tucked inside body (mid-section) — avoids overwriting the bottom arc
        renderer.drawRect(bx + 2, by + 4, 3, 1, 1);
      }
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

    // Tap-to-start overlay
    if (this.waitingForStart) {
      renderer.drawTextCentered('FLAPPY BIRD', GAME_HEIGHT / 2 - 24, 3);
      renderer.drawTextCentered('PRESS A', GAME_HEIGHT / 2 + 12, 2);
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
      lastFlapState: this.lastFlapState,
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
    this.lastFlapState = s.lastFlapState ?? false;
    this._gameOver = false;
    this.bird.y = this.birdY;
  }
}
