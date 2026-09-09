/**
 * @file GameLoop.ts
 * @description 60 FPS fixed timestep game loop with interpolation.
 *   Handles browser tab visibility and provides consistent deltaTime.
 */

import { FIXED_TIMESTEP } from '@/lib/constants';

export abstract class GameLoop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private frameId = 0;
  private readonly maxSubSteps = 5;

  /** Start the game loop */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick.bind(this));
  }

  /** Stop the game loop */
  stop(): void {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  }

  /** Main tick callback */
  private tick(timestamp: number): void {
    if (!this.running) return;

    const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = timestamp;

    // Cap delta time to prevent spiral of death
    const cappedDelta = Math.min(deltaTime, 0.25);
    this.accumulator += cappedDelta;

    // Fixed timestep updates
    let subSteps = 0;
    while (this.accumulator >= FIXED_TIMESTEP && subSteps < this.maxSubSteps) {
      this.update(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
      subSteps++;
    }

    // Render with interpolation
    const interpolation = this.accumulator / FIXED_TIMESTEP;
    this.draw(interpolation);

    this.frameId = requestAnimationFrame(this.tick.bind(this));
  }

  /** Override: game logic update (called at fixed timestep) */
  protected abstract update(deltaTime: number): void;

  /** Override: rendering (called every frame with interpolation) */
  protected abstract draw(interpolation: number): void;
}