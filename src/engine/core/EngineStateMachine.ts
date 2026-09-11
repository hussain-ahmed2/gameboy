/**
 * @file EngineStateMachine.ts
 * @description State machine for the GameBoy engine.
 *   Manages transitions between BOOT, MENU, PLAYING, PAUSED, and GAME_OVER states.
 */

import type { Renderer as RendererType } from '@/lib/types';
import type { Input } from './Input';
import type { GameInfo } from '../games/registry';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@/lib/constants';
import { SaveState } from './SaveState';

/** Engine states */
export enum EngineState {
  BOOT = 'BOOT',
  MENU = 'MENU',
  GAME_SELECT = 'GAME_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/** State change callback */
export type StateChangeCallback = (state: EngineState) => void;

/** Game over info */
export interface GameOverInfo {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
}

/** State machine context */
export interface StateContext {
  renderer: RendererType;
  input: Input;
  games: GameInfo[];
  currentGameId: string;
  gameOverInfo: GameOverInfo | null;
  onStateChange: StateChangeCallback;
  onGameSelect: (gameId: string) => void;
  onGameContinue: (gameId: string) => void;
  onGameResume: () => void;
  onGameRestart: () => void;
  onGameMenu: () => void;
}

/**
 * Engine state machine that manages the game lifecycle.
 */
export class EngineStateMachine {
  private state: EngineState = EngineState.BOOT;
  private context: StateContext;
  private menuIndex: number = 0;
  private gameSelectIndex: number = 0;
  private selectedGameId: string = '';
  private pauseIndex: number = 0;
  private gameOverIndex: number = 0;
  private bootTimer: number = 0;
  private menuScrollOffset: number = 0;
  private readonly bootDuration: number = 2.0;

  /** Stored game framebuffer for overlay states */
  private gameFramebuffer: Uint8Array | null = null;

  constructor(context: StateContext) {
    this.context = context;
  }

  getState(): EngineState {
    return this.state;
  }

  getMenuIndex(): number {
    return this.menuIndex;
  }

  onGameSelect(gameId: string): void {
    this.context.onGameSelect(gameId);
  }

  /** Store the game's framebuffer so overlays can draw on top of it */
  captureGameFrame(fb: Uint8Array): void {
    this.gameFramebuffer = new Uint8Array(fb);
  }

  transition(newState: EngineState): void {
    if (this.state === newState) return;
    this.exitState(this.state);
    this.state = newState;
    this.enterState(newState);
    this.context.onStateChange(newState);
    // Consume input buffer on state change to prevent menu keypress leaking into gameplay
    this.context.input?.update();
  }

  update(deltaTime: number): void {
    const input = this.context.input;
    switch (this.state) {
      case EngineState.BOOT:
        this.updateBoot(deltaTime);
        break;
      case EngineState.MENU:
        this.updateMenu(input);
        break;
      case EngineState.GAME_SELECT:
        this.updateGameSelect(input);
        break;
      case EngineState.PLAYING:
        break;
      case EngineState.PAUSED:
        this.updatePause(input);
        break;
      case EngineState.GAME_OVER:
        this.updateGameOver(input);
        break;
    }
  }

  draw(interpolation: number): void {
    const renderer = this.context.renderer;
    switch (this.state) {
      case EngineState.BOOT:
        this.drawBoot(renderer);
        break;
      case EngineState.MENU:
        this.drawMenu(renderer);
        break;
      case EngineState.GAME_SELECT:
        this.drawGameSelect(renderer);
        break;
      case EngineState.PLAYING:
        break;
      case EngineState.PAUSED:
        this.drawPause(renderer);
        break;
      case EngineState.GAME_OVER:
        this.drawGameOver(renderer);
        break;
    }
  }

  private enterState(state: EngineState): void {
    switch (state) {
      case EngineState.BOOT:
        this.bootTimer = 0;
        break;
      case EngineState.MENU:
        this.menuIndex = 0;
        this.menuScrollOffset = 0;
        break;
      case EngineState.GAME_SELECT:
        this.gameSelectIndex = 0;
        break;
      case EngineState.PAUSED:
        this.pauseIndex = 0;
        break;
      case EngineState.GAME_OVER:
        this.gameOverIndex = 0;
        break;
    }
  }

  private exitState(_state: EngineState): void {}

  private updateBoot(deltaTime: number): void {
    this.bootTimer += deltaTime;
    if (this.bootTimer >= this.bootDuration) {
      this.transition(EngineState.MENU);
    }
  }

  private updateMenu(input: Input): void {
    const games = this.context.games;
    if (games.length === 0) return;

    if (input.isJustPressed('up')) {
      this.menuIndex = (this.menuIndex - 1 + games.length) % games.length;
    }
    if (input.isJustPressed('down')) {
      this.menuIndex = (this.menuIndex + 1) % games.length;
    }
    if (this.menuIndex >= games.length) {
      this.menuIndex = games.length - 1;
    }

    const maxVisible = 7;
    if (this.menuIndex < this.menuScrollOffset) {
      this.menuScrollOffset = this.menuIndex;
    } else if (this.menuIndex >= this.menuScrollOffset + maxVisible) {
      this.menuScrollOffset = this.menuIndex - maxVisible + 1;
    }

    if (input.isJustPressed('a') || input.isJustPressed('start')) {
      const selectedGame = games[this.menuIndex];
      if (selectedGame) {
        const hasSave = SaveState.load(selectedGame.id) !== null;
        if (hasSave) {
          this.selectedGameId = selectedGame.id;
          this.transition(EngineState.GAME_SELECT);
        } else {
          this.context.onGameSelect(selectedGame.id);
        }
      }
    }
  }

  private updateGameSelect(input: Input): void {
    const opts = ['CONTINUE', 'NEW GAME', 'BACK'];

    if (input.isJustPressed('up')) {
      this.gameSelectIndex = (this.gameSelectIndex + 2) % 3;
    }
    if (input.isJustPressed('down')) {
      this.gameSelectIndex = (this.gameSelectIndex + 1) % 3;
    }

    if (input.isJustPressed('a') || input.isJustPressed('start')) {
      switch (this.gameSelectIndex) {
        case 0: this.context.onGameContinue(this.selectedGameId); break;
        case 1: this.context.onGameSelect(this.selectedGameId); break;
        case 2: this.transition(EngineState.MENU); break;
      }
    }

    if (input.isJustPressed('b')) {
      this.transition(EngineState.MENU);
    }
  }

  private updatePause(input: Input): void {
    if (input.isJustPressed('up')) {
      this.pauseIndex = (this.pauseIndex + 2) % 3;
    }
    if (input.isJustPressed('down')) {
      this.pauseIndex = (this.pauseIndex + 1) % 3;
    }

    if (input.isJustPressed('a')) {
      switch (this.pauseIndex) {
        case 0: this.context.onGameResume(); break;
        case 1: this.context.onGameRestart(); break;
        case 2: this.context.onGameMenu(); break;
      }
    }

    if (input.isJustPressed('b')) {
      this.context.onGameResume();
    }

    if (input.isJustPressed('start')) {
      switch (this.pauseIndex) {
        case 0: this.context.onGameResume(); break;
        case 1: this.context.onGameRestart(); break;
        case 2: this.context.onGameMenu(); break;
      }
    }
  }

  private updateGameOver(input: Input): void {
    if (input.isJustPressed('up')) {
      this.gameOverIndex = (this.gameOverIndex + 2) % 3;
    }
    if (input.isJustPressed('down')) {
      this.gameOverIndex = (this.gameOverIndex + 1) % 3;
    }

    if (input.isJustPressed('a')) {
      switch (this.gameOverIndex) {
        case 0: this.context.onGameRestart(); break;
        case 1: this.context.onGameResume(); break;
        case 2: this.context.onGameMenu(); break;
      }
    }

    if (input.isJustPressed('start')) {
      switch (this.gameOverIndex) {
        case 0: this.context.onGameRestart(); break;
        case 1: this.context.onGameResume(); break;
        case 2: this.context.onGameMenu(); break;
      }
    }
  }

  // --- Drawing methods ---
  // 8x8 font on 320x288: ~35 chars/line, 36 lines (plenty of space)

  private drawBoot(renderer: RendererType): void {
    renderer.clear(0);

    const progress = Math.min(this.bootTimer / this.bootDuration, 1);

    // Title: "HA POCKET" centered
    renderer.drawTextCentered('HA POCKET', 50, 3);

    // Loading bar
    const barW = 200;
    const barH = 8;
    const barX = Math.floor((SCREEN_WIDTH - barW) / 2);
    const barY = Math.floor(SCREEN_HEIGHT / 2) - 4;
    renderer.drawRect(barX - 1, barY - 1, barW + 2, barH + 2, 2);
    renderer.drawRect(barX, barY, barW, barH, 1);
    renderer.drawRect(barX, barY, Math.floor(barW * progress), barH, 3);

    // Made by credit on boot screen (always displayed)
    renderer.drawTextCentered('MADE BY HUSSAIN AHMED', SCREEN_HEIGHT - 36, 2);
  }

  private drawMenu(renderer: RendererType): void {
    renderer.clear(0);

    // Title: "SELECT GAME" centered
    renderer.drawTextCentered('SELECT GAME', 6, 3);

    // Separator line
    renderer.drawLine(8, 18, SCREEN_WIDTH - 16, 3);

    // Game list: up to 6 items visible, each 30px tall
    const games = this.context.games;
    const startY = 24;
    const itemH = 30;
    const maxVisible = 7;

    for (let i = 0; i < maxVisible && i + this.menuScrollOffset < games.length; i++) {
      const idx = i + this.menuScrollOffset;
      const game = games[idx];
      const y = startY + i * itemH;
      const sel = idx === this.menuIndex;

      if (sel) {
        // Highlight bar
        renderer.drawRect(4, y - 2, SCREEN_WIDTH - 8, itemH - 4, 3);
      }

      // Game name (8x8 font)
      renderer.drawText(game.name, 12, y, sel ? 0 : 3);

      // Description (max 35 chars to fit 320px at 8px/char + 1 spacing)
      if (game.description) {
        const maxDescChars = 35;
        const desc = game.description.length > maxDescChars
          ? game.description.substring(0, maxDescChars - 1) + '.'
          : game.description;
        renderer.drawText(desc, 12, y + 10, sel ? 1 : 2);
      }
    }

    // Separator before hints
    renderer.drawLine(8, SCREEN_HEIGHT - 26, SCREEN_WIDTH - 16, 3);

    // Controls hint
    renderer.drawTextCentered('UP/DN:SELECT A/ST:GO', SCREEN_HEIGHT - 20, 2);
  }

  private drawGameSelect(renderer: RendererType): void {
    renderer.clear(0);

    // Find game name
    const game = this.context.games.find(g => g.id === this.selectedGameId);
    const gameName = game?.name ?? 'GAME';

    // Title
    renderer.drawTextCentered(gameName, 6, 3);

    // Separator
    renderer.drawLine(8, 18, SCREEN_WIDTH - 16, 3);

    // Prompt box
    const bw = 200, bh = 100;
    const bx = Math.floor((SCREEN_WIDTH - bw) / 2);
    const by = Math.floor((SCREEN_HEIGHT - bh) / 2);
    renderer.drawRect(bx, by, bw, bh, 0);
    renderer.drawRect(bx, by, bw, 1, 3);
    renderer.drawRect(bx, by + bh - 1, bw, 1, 3);
    renderer.drawRect(bx, by, 1, bh, 3);
    renderer.drawRect(bx + bw - 1, by, 1, bh, 3);

    // "SAVE DATA FOUND" text
    renderer.drawTextCentered('SAVE DATA FOUND', by + 8, 2);

    // Separator
    renderer.drawLine(bx + 12, by + 20, bw - 24, 3);

    // Options
    const opts = ['CONTINUE', 'NEW GAME', 'BACK'];
    const optY = by + 30;
    for (let i = 0; i < opts.length; i++) {
      const y = optY + i * 18;
      const sel = i === this.gameSelectIndex;
      if (sel) renderer.drawText('>', bx + 16, y, 3);
      renderer.drawText(opts[i], bx + 28, y, sel ? 3 : 2);
    }

    // Hint
    renderer.drawTextCentered('A/ST:OK  B:BACK', by + bh - 12, 2);
  }

  /** Draw game frame underneath the overlay */
  private drawGameFrameUnderlay(renderer: RendererType): void {
    if (this.gameFramebuffer) {
      const fb = renderer.getFramebuffer();
      fb.set(this.gameFramebuffer);
    } else {
      renderer.clear(0);
    }
  }

  private drawPause(renderer: RendererType): void {
    this.drawGameFrameUnderlay(renderer);

    // Semi-transparent overlay (checkerboard pattern)
    for (let y = 0; y < SCREEN_HEIGHT; y += 2) {
      for (let x = 0; x < SCREEN_WIDTH; x += 2) {
        if ((x + y) % 4 === 0) {
          renderer.drawRect(x, y, 2, 2, 2);
        }
      }
    }

    // Pause box: centered
    const bw = 180, bh = 100;
    const bx = Math.floor((SCREEN_WIDTH - bw) / 2);
    const by = Math.floor((SCREEN_HEIGHT - bh) / 2);
    renderer.drawRect(bx, by, bw, bh, 0);
    renderer.drawRect(bx, by, bw, 1, 3);
    renderer.drawRect(bx, by + bh - 1, bw, 1, 3);
    renderer.drawRect(bx, by, 1, bh, 3);
    renderer.drawRect(bx + bw - 1, by, 1, bh, 3);

    // Title
    renderer.drawTextCentered('PAUSED', by + 8, 3);

    // Separator
    renderer.drawLine(bx + 12, by + 18, bw - 24, 3);

    // Options
    const opts = ['RESUME', 'RESTART', 'MENU'];
    const optY = by + 26;
    for (let i = 0; i < opts.length; i++) {
      const y = optY + i * 18;
      const sel = i === this.pauseIndex;
      if (sel) renderer.drawText('>', bx + 16, y, 3);
      renderer.drawText(opts[i], bx + 28, y, sel ? 3 : 2);
    }

    // Hint
    renderer.drawTextCentered('A/ST:OK  B:BACK', by + bh - 12, 2);
  }

  private drawGameOver(renderer: RendererType): void {
    this.drawGameFrameUnderlay(renderer);

    // Semi-transparent overlay
    for (let y = 0; y < SCREEN_HEIGHT; y += 2) {
      for (let x = 0; x < SCREEN_WIDTH; x += 2) {
        if ((x + y) % 4 === 0) {
          renderer.drawRect(x, y, 2, 2, 2);
        }
      }
    }

    // Game over box: centered
    const bw = 240, bh = 140;
    const bx = Math.floor((SCREEN_WIDTH - bw) / 2);
    const by = Math.floor((SCREEN_HEIGHT - bh) / 2);
    renderer.drawRect(bx, by, bw, bh, 0);
    renderer.drawRect(bx, by, bw, 1, 3);
    renderer.drawRect(bx, by + bh - 1, bw, 1, 3);
    renderer.drawRect(bx, by, 1, bh, 3);
    renderer.drawRect(bx + bw - 1, by, 1, bh, 3);

    // Title
    renderer.drawTextCentered('GAME OVER', by + 8, 3);

    // Score
    const info = this.context.gameOverInfo;
    if (info) {
      renderer.drawTextCentered(`SCORE: ${info.score}`, by + 22, 3);
      if (info.isNewHighScore) {
        renderer.drawTextCentered('NEW HIGH SCORE!', by + 34, 2);
      } else {
        renderer.drawTextCentered(`HIGH: ${info.highScore}`, by + 34, 2);
      }
    }

    // Separator
    renderer.drawLine(bx + 12, by + 46, bw - 24, 3);

    // Options
    const opts = ['NEW GAME', 'CONTINUE', 'MENU'];
    const optY = by + 54;
    for (let i = 0; i < opts.length; i++) {
      const y = optY + i * 18;
      const sel = i === this.gameOverIndex;
      if (sel) renderer.drawText('>', bx + 16, y, 3);
      renderer.drawText(opts[i], bx + 28, y, sel ? 3 : 2);
    }

    // Hint
    renderer.drawTextCentered('A/ST:OK  B:BACK', by + bh - 12, 2);
  }
}
