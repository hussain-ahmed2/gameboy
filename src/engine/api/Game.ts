/**
 * @file Game.ts
 * @description Base Game class - extend to create games.
 *   Provides lifecycle hooks: init, update, draw.
 */

import type { Renderer, GamePadState } from '@/lib/types';

export abstract class Game {
  /** Renderer instance (set by engine) */
  protected renderer!: Renderer;
  /** Input instance (set by engine) */
  protected input!: Input;
  /** Audio instance (set by engine) */
  protected audio!: Audio;

  /** Initialize the game (called once on start) */
  abstract init(): void;

  /** Update game logic (called 60 times/second) */
  abstract update(input: GamePadState, deltaTime: number): void;

  /** Draw the game (called every frame) */
  abstract draw(renderer: Renderer): void;

  /** Called when game starts */
  onStart(): void {}

  /** Called when game is paused */
  onPause(): void {}

  /** Called when game resumes */
  onResume(): void {}

  /** Called when game is reset */
  onReset(): void {}
}

// Import needed for abstract class
import { Input } from '@/engine/core';
import { Audio } from '@/engine/core';