/**
 * @file Game.ts
 * @description Base Game class - extend to create games.
 *   Provides lifecycle hooks: init, update, draw, save/load.
 */

import type { Renderer, GamePadState } from '@/lib/types';
import { Input } from '@/engine/core';
import { Audio } from '@/engine/core';
import { SaveState } from '@/engine/core';

/** Game over info returned by games */
export interface GameOverData {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
}

export abstract class Game {
  /** Renderer instance (set by engine) */
  renderer!: Renderer;
  /** Input instance (set by engine) */
  input!: Input;
  /** Audio instance (set by engine) */
  audio!: Audio;

  /** Game ID for save state */
  abstract readonly gameId: string;

  /** Initialize the game (called once on start) */
  abstract init(): void;

  /** Update game logic (called 60 times/second) */
  abstract update(input: GamePadState, deltaTime: number): void;

  /** Draw the game (called every frame) */
  abstract draw(renderer: Renderer): void;

  /** Get current score */
  abstract getScore(): number;

  /** Get high score */
  abstract getHighScore(): number;

  /** Check if game is over */
  abstract isGameOver(): boolean;

  /** Get game over data for display */
  getGameOverData(): GameOverData {
    const score = this.getScore();
    const highScore = this.getHighScore();
    return {
      score,
      highScore,
      isNewHighScore: score > highScore && score > 0,
    };
  }

  /** Save game state (return serializable object) */
  abstract saveState(): object;

  /** Load game state from saved data */
  abstract loadState(state: object): void;

  /** Check if game has a save state */
  hasSaveState(): boolean {
    return SaveState.load(this.gameId) !== null;
  }

  /** Save current state to localStorage */
  saveToStorage(): void {
    const state = this.saveState();
    SaveState.save(this.gameId, state);
  }

  /** Load state from localStorage */
  loadFromStorage(): boolean {
    const state = SaveState.load(this.gameId);
    if (state && typeof state === 'object') {
      this.loadState(state);
      return true;
    }
    return false;
  }

  /** Called when game starts */
  onStart(): void {}

  /** Called when game is paused */
  onPause(): void {
    this.saveToStorage();
  }

  /** Called when game resumes */
  onResume(): void {}

  /** Called when game is reset */
  onReset(): void {
    SaveState.delete(this.gameId);
  }
}
