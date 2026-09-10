/**
 * @file BombermanGame.ts
 * @description Classic Bomberman - place bombs, destroy blocks, find the exit.
 */

import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/constants';

const COLS = 13;
const ROWS = 11;
const TILE = 8;
const GRID_OFFSET_X = 28;
const GRID_OFFSET_Y = 16;

const BOMB_TIMER = 2;
const EXPLOSION_DURATION = 0.4;
const ENEMY_SPEED = 30;
const BASE_MOVE_SPEED = 4;

const HIGHSCORE_KEY = 'bomberman_highscore';

const enum Cell {
  Empty = 0,
  Wall = 1,
  Block = 2,
  Exit = 3,
}

interface Bomb {
  gx: number;
  gy: number;
  timer: number;
}

interface Explosion {
  cells: { gx: number; gy: number }[];
  timer: number;
}

interface Enemy {
  gx: number;
  gy: number;
  px: number;
  py: number;
  dir: { x: number; y: number };
  moveTimer: number;
  active: boolean;
}

interface PowerUp {
  gx: number;
  gy: number;
  type: 'bomb' | 'fire' | 'speed';
}

interface BombermanSaveState {
  grid: Cell[][];
  playerGx: number;
  playerGy: number;
  bombsPlaced: number;
  maxBombs: number;
  fireRange: number;
  speedLevel: number;
  score: number;
  lives: number;
  enemies: { gx: number; gy: number; dir: { x: number; y: number } }[];
  powerUps: PowerUp[];
  exitGx: number;
  exitGy: number;
  exitRevealed: boolean;
}

export class BombermanGame extends Game {
  readonly gameId = 'bomberman';

  private grid: Cell[][] = [];
  private playerGx = 0;
  private playerGy = 0;
  private playerPx = 0;
  private playerPy = 0;
  private targetPx = 0;
  private targetPy = 0;
  private moving = false;

  private maxBombs = 1;
  private activeBombs = 0;
  private fireRange = 3;
  private speedLevel = 1;
  private bombs: Bomb[] = [];
  private explosions: Explosion[] = [];
  private bombCooldowns: Map<string, boolean> = new Map();

  private enemies: Enemy[] = [];
  private powerUps: PowerUp[] = [];

  private exitGx = 0;
  private exitGy = 0;
  private exitRevealed = false;

  private _score = 0;
  private _lives = 3;
  private _gameOver = false;
  private _gameWon = false;
  private highScore = 0;

  private moveTimer = 0;
  private lastMoveDir = { x: 0, y: 0 };
  private bombPressed = false;
  private gameOverTimer = 0;
  private winTimer = 0;

  private blinkTimer = 0;
  private bombBlink = true;

  init(): void {
    const saved = SaveState.load(HIGHSCORE_KEY);
    if (typeof saved === 'number') {
      this.highScore = saved;
    }
    this.startLevel();
  }

  private startLevel(): void {
    this.grid = [];
    for (let gy = 0; gy < ROWS; gy++) {
      this.grid[gy] = [];
      for (let gx = 0; gx < COLS; gx++) {
        if (gx % 2 === 1 && gy % 2 === 1) {
          this.grid[gy][gx] = Cell.Wall;
        } else {
          this.grid[gy][gx] = Cell.Block;
        }
      }
    }

    this.grid[0][0] = Cell.Empty;
    this.grid[0][1] = Cell.Empty;
    this.grid[1][0] = Cell.Empty;

    const destroyableCells: { gx: number; gy: number }[] = [];
    for (let gy = 0; gy < ROWS; gy++) {
      for (let gx = 0; gx < COLS; gx++) {
        if (this.grid[gy][gx] === Cell.Block) {
          destroyableCells.push({ gx, gy });
        }
      }
    }

    const exitIdx = Math.floor(Math.random() * destroyableCells.length);
    this.exitGx = destroyableCells[exitIdx].gx;
    this.exitGy = destroyableCells[exitIdx].gy;
    this.grid[this.exitGy][this.exitGx] = Cell.Exit;
    this.exitRevealed = false;

    for (let i = destroyableCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [destroyableCells[i], destroyableCells[j]] = [destroyableCells[j], destroyableCells[i]];
    }

    this.powerUps = [];
    for (const cell of destroyableCells) {
      if (cell.gx === this.exitGx && cell.gy === this.exitGy) continue;
      if (Math.random() < 0.2) {
        const types: PowerUp['type'][] = ['bomb', 'fire', 'speed'];
        this.powerUps.push({
          gx: cell.gx,
          gy: cell.gy,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }
    }

    this.playerGx = 0;
    this.playerGy = 0;
    this.playerPx = GRID_OFFSET_X;
    this.playerPy = GRID_OFFSET_Y;
    this.targetPx = GRID_OFFSET_X;
    this.targetPy = GRID_OFFSET_Y;
    this.moving = false;

    this.bombs = [];
    this.explosions = [];
    this.bombCooldowns.clear();
    this.activeBombs = 0;

    this.enemies = [];
    const enemyCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < enemyCount; i++) {
      let ex: number, ey: number;
      let attempts = 0;
      do {
        ex = Math.floor(Math.random() * COLS);
        ey = Math.floor(Math.random() * ROWS);
        attempts++;
      } while (attempts < 100 && (
        this.grid[ey][ex] !== Cell.Empty ||
        (ex <= 2 && ey <= 2)
      ));
      this.enemies.push({
        gx: ex,
        gy: ey,
        px: GRID_OFFSET_X + ex * TILE,
        py: GRID_OFFSET_Y + ey * TILE,
        dir: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }][
          Math.floor(Math.random() * 4)
        ],
        moveTimer: 0,
        active: true,
      });
    }
  }

  update(input: GamePadState, deltaTime: number): void {
    if (this._gameOver || this._gameWon) {
      this.gameOverTimer += deltaTime;
      return;
    }

    this.blinkTimer += deltaTime;
    if (this.blinkTimer > 0.2) {
      this.blinkTimer -= 0.2;
      this.bombBlink = !this.bombBlink;
    }

    this.updateBombs(deltaTime);
    this.updateExplosions(deltaTime);
    this.updateEnemies(deltaTime);
    this.updatePlayerMovement(deltaTime);

    if (!this.moving) {
      if (input.up) {
        this.tryMove(0, -1);
      } else if (input.down) {
        this.tryMove(0, 1);
      } else if (input.left) {
        this.tryMove(-1, 0);
      } else if (input.right) {
        this.tryMove(1, 0);
      }
    }

    if (input.a && !this.bombPressed) {
      this.placeBomb();
    }
    this.bombPressed = input.a;

    this.checkEnemyCollision();
    this.checkExplosionCollision();
    this.checkExitReached();
  }

  private updatePlayerMovement(dt: number): void {
    if (!this.moving) return;

    const speed = BASE_MOVE_SPEED + this.speedLevel - 1;
    const step = TILE * speed * dt;

    const dx = this.targetPx - this.playerPx;
    const dy = this.targetPy - this.playerPy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= step) {
      this.playerPx = this.targetPx;
      this.playerPy = this.targetPy;
      this.moving = false;
    } else {
      this.playerPx += (dx / dist) * step;
      this.playerPy += (dy / dist) * step;
    }
  }

  private tryMove(dx: number, dy: number): void {
    const newGx = this.playerGx + dx;
    const newGy = this.playerGy + dy;

    if (newGx < 0 || newGx >= COLS || newGy < 0 || newGy >= ROWS) return;
    if (this.grid[newGy][newGx] === Cell.Wall) return;
    if (this.grid[newGy][newGx] === Cell.Block) return;

    for (const bomb of this.bombs) {
      if (bomb.gx === newGx && bomb.gy === newGy) return;
    }

    this.playerGx = newGx;
    this.playerGy = newGy;
    this.targetPx = GRID_OFFSET_X + newGx * TILE;
    this.targetPy = GRID_OFFSET_Y + newGy * TILE;
    this.moving = true;
    this.lastMoveDir = { x: dx, y: dy };
  }

  private placeBomb(): void {
    if (this.activeBombs >= this.maxBombs) return;
    const key = `${this.playerGx},${this.playerGy}`;
    if (this.bombCooldowns.has(key)) return;

    this.bombs.push({
      gx: this.playerGx,
      gy: this.playerGy,
      timer: BOMB_TIMER,
    });
    this.activeBombs++;
    this.bombCooldowns.set(key, true);
    this.audio.beep();
  }

  private updateBombs(dt: number): void {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      this.bombs[i].timer -= dt;
      if (this.bombs[i].timer <= 0) {
        this.explodeBomb(this.bombs[i]);
        this.bombs.splice(i, 1);
        this.activeBombs--;
      }
    }
  }

  private explodeBomb(bomb: Bomb): void {
    const cells: { gx: number; gy: number }[] = [{ gx: bomb.gx, gy: bomb.gy }];
    this.grid[bomb.gy][bomb.gx] = Cell.Empty;

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const dir of dirs) {
      for (let r = 1; r <= this.fireRange; r++) {
        const gx = bomb.gx + dir.x * r;
        const gy = bomb.gy + dir.y * r;

        if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) break;

        const cell = this.grid[gy][gx];
        if (cell === Cell.Wall) break;

        cells.push({ gx, gy });

        if (cell === Cell.Block) {
          this.grid[gy][gx] = Cell.Empty;
          this._score += 10;
          break;
        }

        if (cell === Cell.Exit) {
          break;
        }
      }
    }

    this.explosions.push({ cells, timer: EXPLOSION_DURATION });
    this.audio.explosion();

    for (const e of this.enemies) {
      if (!e.active) continue;
      for (const c of cells) {
        if (e.gx === c.gx && e.gy === c.gy) {
          e.active = false;
          this._score += 100;
          break;
        }
      }
    }

    if (!this.moving) {
      for (const c of cells) {
        if (c.gx === this.playerGx && c.gy === this.playerGy) {
          this.damagePlayer();
          break;
        }
      }
    }

    this.revealExit();
    this.bombCooldowns.delete(`${bomb.gx},${bomb.gy}`);
  }

  private updateExplosions(dt: number): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].timer -= dt;
      if (this.explosions[i].timer <= 0) {
        this.explosions.splice(i, 1);
      }
    }
  }

  private checkExplosionCollision(): void {
    for (const exp of this.explosions) {
      for (const c of exp.cells) {
        if (c.gx === this.playerGx && c.gy === this.playerGy) {
          this.damagePlayer();
          return;
        }
      }
    }
  }

  private checkEnemyCollision(): void {
    for (const e of this.enemies) {
      if (!e.active) continue;
      if (e.gx === this.playerGx && e.gy === this.playerGy) {
        this.damagePlayer();
        return;
      }
    }
  }

  private damagePlayer(): void {
    if (this._gameOver) return;
    this._lives--;
    if (this._lives <= 0) {
      this._gameOver = true;
      this.gameOverTimer = 0;
      this.audio.explosion();
    } else {
      this.audio.boop();
      this.playerGx = 0;
      this.playerGy = 0;
      this.playerPx = GRID_OFFSET_X;
      this.playerPy = GRID_OFFSET_Y;
      this.targetPx = GRID_OFFSET_X;
      this.targetPy = GRID_OFFSET_Y;
      this.moving = false;
    }
  }

  private revealExit(): void {
    if (this.exitRevealed) return;
    const cell = this.grid[this.exitGy][this.exitGx];
    if (cell === Cell.Block) return;

    let hasBlockInPath = false;
    const dx = this.exitGx - this.playerGx;
    const dy = this.exitGy - this.playerGy;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (adx >= ady) {
      const stepX = dx > 0 ? 1 : -1;
      for (let i = 1; i <= adx; i++) {
        const checkX = this.playerGx + stepX * i;
        if (checkX < 0 || checkX >= COLS) break;
        if (this.grid[this.playerGy][checkX] === Cell.Block) {
          hasBlockInPath = true;
          break;
        }
      }
    } else {
      const stepY = dy > 0 ? 1 : -1;
      for (let i = 1; i <= ady; i++) {
        const checkY = this.playerGy + stepY * i;
        if (checkY < 0 || checkY >= ROWS) break;
        if (this.grid[checkY][this.playerGx] === Cell.Block) {
          hasBlockInPath = true;
          break;
        }
      }
    }

    if (!hasBlockInPath) {
      this.exitRevealed = true;
    }
  }

  private checkExitReached(): void {
    if (!this.exitRevealed) return;
    if (this.playerGx === this.exitGx && this.playerGy === this.exitGy) {
      this._gameWon = true;
      this.winTimer = 0;
      this._score += 500;
      this.audio.jump();

      if (this._score > this.highScore) {
        this.highScore = this._score;
        SaveState.save(HIGHSCORE_KEY, this.highScore);
      }
    }
  }

  private updateEnemies(dt: number): void {
    for (const e of this.enemies) {
      if (!e.active) continue;

      e.moveTimer += dt * ENEMY_SPEED;
      if (e.moveTimer >= 1) {
        e.moveTimer -= 1;

        const newGx = e.gx + e.dir.x;
        const newGy = e.gy + e.dir.y;

        if (
          newGx >= 0 && newGx < COLS &&
          newGy >= 0 && newGy < ROWS &&
          this.grid[newGy][newGx] !== Cell.Wall &&
          this.grid[newGy][newGx] !== Cell.Block
        ) {
          e.gx = newGx;
          e.gy = newGy;
        } else {
          const choices: { x: number; y: number }[] = [];
          if (e.dir.x !== 0) {
            choices.push({ x: 0, y: -1 });
            choices.push({ x: 0, y: 1 });
          }
          if (e.dir.y !== 0) {
            choices.push({ x: -1, y: 0 });
            choices.push({ x: 1, y: 0 });
          }
          if (choices.length === 0) {
            choices.push({ x: -e.dir.x, y: 0 }, { x: 0, y: -e.dir.y });
          }
          e.dir = choices[Math.floor(Math.random() * choices.length)];
        }
      }

      e.px = GRID_OFFSET_X + e.gx * TILE;
      e.py = GRID_OFFSET_Y + e.gy * TILE;
    }
  }

  draw(renderer: Renderer): void {
    renderer.clear(0);

    for (let gy = 0; gy < ROWS; gy++) {
      for (let gx = 0; gx < COLS; gx++) {
        const px = GRID_OFFSET_X + gx * TILE;
        const py = GRID_OFFSET_Y + gy * TILE;
        const cell = this.grid[gy][gx];

        if (cell === Cell.Wall) {
          renderer.drawRect(px, py, TILE, TILE, 3);
        } else if (cell === Cell.Block) {
          renderer.drawRect(px, py, TILE, TILE, 2);
        } else if (cell === Cell.Empty || cell === Cell.Exit) {
          if ((gx + gy) % 2 === 0) {
            renderer.drawRect(px, py, TILE, TILE, 1);
          } else {
            renderer.drawRect(px, py, TILE, TILE, 0);
          }
        }
      }
    }

    if (this.exitRevealed) {
      const px = GRID_OFFSET_X + this.exitGx * TILE;
      const py = GRID_OFFSET_Y + this.exitGy * TILE;
      renderer.drawRect(px + 2, py + 2, TILE - 4, TILE - 4, 1);
    }

    for (const pu of this.powerUps) {
      const cell = this.grid[pu.gy][pu.gx];
      if (cell !== Cell.Block) {
        const px = GRID_OFFSET_X + pu.gx * TILE + 2;
        const py = GRID_OFFSET_Y + pu.gy * TILE + 2;
        renderer.drawRect(px, py, TILE - 4, TILE - 4, 1);
      }
    }

    for (const bomb of this.bombs) {
      if (this.bombBlink) {
        const px = GRID_OFFSET_X + bomb.gx * TILE;
        const py = GRID_OFFSET_Y + bomb.gy * TILE;
        renderer.drawRect(px + 1, py + 1, TILE - 2, TILE - 2, 2);
      }
    }

    for (const exp of this.explosions) {
      for (const c of exp.cells) {
        const px = GRID_OFFSET_X + c.gx * TILE;
        const py = GRID_OFFSET_Y + c.gy * TILE;
        renderer.drawRect(px, py, TILE, TILE, 3);
      }
    }

    for (const e of this.enemies) {
      if (!e.active) continue;
      renderer.drawRect(e.px + 1, e.py + 1, TILE - 2, TILE - 2, 2);
    }

    renderer.drawRect(this.playerPx + 1, this.playerPy + 1, TILE - 2, TILE - 2, 3);

    renderer.drawText(`SCORE:${this._score}`, 4, 4, 3);

    for (let i = 0; i < this._lives; i++) {
      renderer.drawRect(4 + i * 8, 12, 5, 5, 3);
    }
  }

  getScore(): number {
    return this._score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  isGameOver(): boolean {
    return this._gameOver || this._gameWon;
  }

  saveState(): object {
    return {
      grid: this.grid.map(row => [...row]),
      playerGx: this.playerGx,
      playerGy: this.playerGy,
      maxBombs: this.maxBombs,
      fireRange: this.fireRange,
      speedLevel: this.speedLevel,
      score: this._score,
      lives: this._lives,
      enemies: this.enemies
        .filter(e => e.active)
        .map(e => ({ gx: e.gx, gy: e.gy, dir: { ...e.dir } })),
      powerUps: this.powerUps.map(p => ({ gx: p.gx, gy: p.gy, type: p.type })),
      exitGx: this.exitGx,
      exitGy: this.exitGy,
      exitRevealed: this.exitRevealed,
    };
  }

  loadState(state: object): void {
    const s = state as BombermanSaveState;
    this.grid = s.grid.map(row => [...row]);
    this.playerGx = s.playerGx;
    this.playerGy = s.playerGy;
    this.playerPx = GRID_OFFSET_X + s.playerGx * TILE;
    this.playerPy = GRID_OFFSET_Y + s.playerGy * TILE;
    this.targetPx = this.playerPx;
    this.targetPy = this.playerPy;
    this.moving = false;
    this.maxBombs = s.maxBombs;
    this.fireRange = s.fireRange;
    this.speedLevel = s.speedLevel;
    this._score = s.score;
    this._lives = s.lives;
    this._gameOver = false;
    this._gameWon = false;
    this.bombs = [];
    this.explosions = [];
    this.activeBombs = 0;
    this.bombCooldowns.clear();
    this.exitGx = s.exitGx;
    this.exitGy = s.exitGy;
    this.exitRevealed = s.exitRevealed;
    this.powerUps = s.powerUps.map(p => ({ ...p }));
    this.enemies = s.enemies.map(e => ({
      gx: e.gx,
      gy: e.gy,
      px: GRID_OFFSET_X + e.gx * TILE,
      py: GRID_OFFSET_Y + e.gy * TILE,
      dir: { ...e.dir },
      moveTimer: 0,
      active: true,
    }));
  }
}
