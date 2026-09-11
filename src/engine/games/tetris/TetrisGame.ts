/**
 * @file TetrisGame.ts
 * @description Classic Tetris - stack tetrominoes, clear lines, score points.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';

const COLS = 10;
const ROWS = 20;
const TILE = 8;
const FIELD_X = 40;
const FIELD_Y = 16;

const HIGHSCORE_KEY = 'tetris_highscore';

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

interface TetrisSaveState {
  field: number[][];
  current: ActivePiece | null;
  next: TetrominoType;
  score: number;
  level: number;
  lines: number;
  fallTimer: number;
  lockDelay: number;
  isLocking: boolean;
}

const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const PIECE_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const PIECE_COLORS: Record<TetrominoType, number> = {
  I: 0,
  O: 1,
  T: 2,
  S: 3,
  Z: 2,
  J: 1,
  L: 3,
};

const SCORE_TABLE = [0, 40, 100, 300, 1200];

export class TetrisGame extends Game {
  readonly gameId = 'tetris';

  private field: number[][] = [];
  private current: ActivePiece | null = null;
  private nextType: TetrominoType = 'T';
  private _score = 0;
  private _level = 1;
  private _lines = 0;
  private highScore = 0;
  private _gameOver = false;
  private fallTimer = 0;
  private lockDelay = 0;
  private lockDelayMax = 500;
  private isLocking = false;

  private inputLeft = false;
  private inputRight = false;
  private inputUp = false;
  private inputA = false;

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }

    this.field = [];
    for (let y = 0; y < ROWS; y++) {
      this.field.push(new Array(COLS).fill(0));
    }
    this._score = 0;
    this._level = 1;
    this._lines = 0;
    this._gameOver = false;
    this.fallTimer = 0;
    this.lockDelay = 0;
    this.isLocking = false;

    this.nextType = this.randomType();
    this.spawnPiece();
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver) {
      if (input.start) {
        this.init();
      }
      return;
    }

    const dtMs = deltaTime * 1000;

    if (input.left && !this.inputLeft) {
      this.movePiece(-1, 0);
    }
    this.inputLeft = input.left;

    if (input.right && !this.inputRight) {
      this.movePiece(1, 0);
    }
    this.inputRight = input.right;

    if (input.up && !this.inputUp) {
      this.rotatePiece();
    }
    this.inputUp = input.up;

    if (input.down) {
      this.fallTimer += dtMs;
      const interval = this.getFallInterval();
      if (this.fallTimer >= interval) {
        this.fallTimer = 0;
        if (!this.movePiece(0, 1)) {
          this.lockPiece();
        } else {
          this._score += 1;
        }
      }
    } else {
    }

    if (input.a && !this.inputA) {
      this.hardDrop();
    }
    this.inputA = input.a;

    if (!input.down) {
      this.fallTimer += dtMs;
      const interval = this.getFallInterval();
      if (this.fallTimer >= interval) {
        this.fallTimer = 0;
        if (!this.movePiece(0, 1)) {
          if (!this.isLocking) {
            this.isLocking = true;
            this.lockDelay = 0;
          }
        }
      }
    }

    if (this.isLocking) {
      this.lockDelay += dtMs;
      if (this.lockDelay >= this.lockDelayMax) {
        this.lockPiece();
      }
    }
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (this.field[y][x] !== 0) {
          const color = this.field[y][x] as number;
          renderer.drawRect(
            FIELD_X + x * TILE,
            FIELD_Y + y * TILE,
            TILE - 1,
            TILE - 1,
            color as 0 | 1 | 2 | 3
          );
        }
      }
    }

    if (this.current) {
      const ghostY = this.getGhostY();
      const shape = this.current.shape;
      for (let ry = 0; ry < shape.length; ry++) {
        for (let rx = 0; rx < shape[ry].length; rx++) {
          if (shape[ry][rx]) {
            const gx = this.current.x + rx;
            const gy = ghostY + ry;
            if (gy >= 0 && gy < ROWS) {
              renderer.drawRect(
                FIELD_X + gx * TILE,
                FIELD_Y + gy * TILE,
                TILE - 1,
                TILE - 1,
                1
              );
            }
          }
        }
      }

      const color = PIECE_COLORS[this.current.type] as 0 | 1 | 2 | 3;
      for (let ry = 0; ry < shape.length; ry++) {
        for (let rx = 0; rx < shape[ry].length; rx++) {
          if (shape[ry][rx]) {
            const px = this.current.x + rx;
            const py = this.current.y + ry;
            if (py >= 0) {
              renderer.drawRect(
                FIELD_X + px * TILE,
                FIELD_Y + py * TILE,
                TILE - 1,
                TILE - 1,
                color
              );
            }
          }
        }
      }
    }

    renderer.drawRect(FIELD_X - 1, FIELD_Y - 1, COLS * TILE + 2, ROWS * TILE + 2, 2);

    // HUD separator
    renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2);

    renderer.drawText('TETRIS', 4, 2, 3);

    const nextShape = TETROMINOES[this.nextType];
    const nextColor = PIECE_COLORS[this.nextType] as 0 | 1 | 2 | 3;
    const previewX = FIELD_X + COLS * TILE + 6;
    const previewY = FIELD_Y + 16;
    for (let ry = 0; ry < nextShape.length; ry++) {
      for (let rx = 0; rx < nextShape[ry].length; rx++) {
        if (nextShape[ry][rx]) {
          renderer.drawRect(
            previewX + rx * (TILE - 2),
            previewY + ry * (TILE - 2),
            TILE - 3,
            TILE - 3,
            nextColor
          );
        }
      }
    }

    renderer.drawText(`SCORE`, 4, FIELD_Y + 8, 2);
    renderer.drawText(`${this._score}`, 4, FIELD_Y + 16, 3);
    renderer.drawText(`LEVEL`, 4, FIELD_Y + 32, 2);
    renderer.drawText(`${this._level}`, 4, FIELD_Y + 40, 3);
    renderer.drawText(`LINES`, 4, FIELD_Y + 56, 2);
    renderer.drawText(`${this._lines}`, 4, FIELD_Y + 64, 3);
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
      field: this.field.map(row => [...row]),
      current: this.current
        ? { type: this.current.type, shape: this.current.shape.map(r => [...r]), x: this.current.x, y: this.current.y }
        : null,
      next: this.nextType,
      score: this._score,
      level: this._level,
      lines: this._lines,
      fallTimer: this.fallTimer,
      lockDelay: this.lockDelay,
      isLocking: this.isLocking,
    };
  }

  loadState(state: object): void {
    const s = state as TetrisSaveState;
    this.field = s.field.map(row => [...row]);
    if (s.current) {
      this.current = {
        type: s.current.type,
        shape: s.current.shape.map(r => [...r]),
        x: s.current.x,
        y: s.current.y,
      };
    } else {
      this.current = null;
    }
    this.nextType = s.next;
    this._score = s.score;
    this._level = s.level;
    this._lines = s.lines;
    this.fallTimer = s.fallTimer;
    this.lockDelay = s.lockDelay ?? 0;
    this.isLocking = s.isLocking ?? false;
    this._gameOver = false;
  }

  private randomType(): TetrominoType {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  private spawnPiece(): void {
    const type = this.nextType;
    this.nextType = this.randomType();
    const shape = TETROMINOES[type].map(row => [...row]);
    const startCol = Math.floor((COLS - shape[0].length) / 2);

    this.current = {
      type,
      shape,
      x: startCol,
      y: 0,
    };

    this.isLocking = false;
    this.lockDelay = 0;
    this.fallTimer = 0;

    if (this.collides(this.current.shape, this.current.x, this.current.y)) {
      this._gameOver = true;
      this.audio.explosion();
      if (this._score > this.highScore) {
        this.highScore = this._score;
        SaveState.save(HIGHSCORE_KEY, this.highScore);
      }
    }
  }

  private collides(shape: number[][], ox: number, oy: number): boolean {
    for (let ry = 0; ry < shape.length; ry++) {
      for (let rx = 0; rx < shape[ry].length; rx++) {
        if (shape[ry][rx]) {
          const fx = ox + rx;
          const fy = oy + ry;
          if (fx < 0 || fx >= COLS || fy >= ROWS) return true;
          if (fy >= 0 && this.field[fy][fx] !== 0) return true;
        }
      }
    }
    return false;
  }

  private movePiece(dx: number, dy: number): boolean {
    if (!this.current) return false;
    if (!this.collides(this.current.shape, this.current.x + dx, this.current.y + dy)) {
      this.current.x += dx;
      this.current.y += dy;
      if (dx !== 0) this.isLocking = false;
      return true;
    }
    return false;
  }

  private rotatePiece(): void {
    if (!this.current || this.current.type === 'O') return;
    const shape = this.current.shape;
    const size = shape.length;
    const rotated: number[][] = [];
    for (let i = 0; i < size; i++) {
      rotated.push(new Array(size).fill(0));
    }
    for (let ry = 0; ry < size; ry++) {
      for (let rx = 0; rx < size; rx++) {
        rotated[rx][size - 1 - ry] = shape[ry][rx];
      }
    }

    if (!this.collides(rotated, this.current.x, this.current.y)) {
      this.current.shape = rotated;
      this.audio.beep();
      this.isLocking = false;
      return;
    }

    const kicks = [-1, 1, -2, 2];
    for (const kick of kicks) {
      if (!this.collides(rotated, this.current.x + kick, this.current.y)) {
        this.current.shape = rotated;
        this.current.x += kick;
        this.audio.beep();
        this.isLocking = false;
        return;
      }
    }

    if (!this.collides(rotated, this.current.x, this.current.y - 1)) {
      this.current.shape = rotated;
      this.current.y -= 1;
      this.audio.beep();
      this.isLocking = false;
      return;
    }
  }

  private lockPiece(): void {
    if (!this.current) return;

    const shape = this.current.shape;
    for (let ry = 0; ry < shape.length; ry++) {
      for (let rx = 0; rx < shape[ry].length; rx++) {
        if (shape[ry][rx]) {
          const fx = this.current.x + rx;
          const fy = this.current.y + ry;
          if (fy >= 0 && fy < ROWS && fx >= 0 && fx < COLS) {
            this.field[fy][fx] = PIECE_COLORS[this.current.type] as number;
          }
        }
      }
    }

    const cleared = this.clearLines();
    if (cleared > 0) {
      this._score += SCORE_TABLE[cleared] * this._level;
      this._lines += cleared;
      this._level = Math.floor(this._lines / 10) + 1;
      this.audio.coin();
    }

    if (this._score > this.highScore) {
      this.highScore = this._score;
      SaveState.save(HIGHSCORE_KEY, this.highScore);
    }

    this.spawnPiece();
  }

  private clearLines(): number {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.field[y].every(cell => cell !== 0)) {
        this.field.splice(y, 1);
        this.field.unshift(new Array(COLS).fill(0));
        cleared++;
        y++;
      }
    }
    return cleared;
  }

  private getGhostY(): number {
    if (!this.current) return 0;
    let gy = this.current.y;
    while (!this.collides(this.current.shape, this.current.x, gy + 1)) {
      gy++;
    }
    return gy;
  }

  private hardDrop(): void {
    if (!this.current) return;
    let rows = 0;
    while (!this.collides(this.current.shape, this.current.x, this.current.y + 1)) {
      this.current.y++;
      rows++;
    }
    this._score += rows * 2;
    this.audio.boop();
    this.lockPiece();
  }

  private getFallInterval(): number {
    return Math.max(100, 800 - (this._level - 1) * 70);
  }
}
