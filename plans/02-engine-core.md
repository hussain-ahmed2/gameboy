# Plan: Engine Core

## Goal
Build the core engine: GameLoop (60 FPS fixed timestep), Renderer (Canvas 2D with DMG palette), Input (Keyboard/Touch), Audio (Web Audio API), and SaveState (localStorage).

## Files

### 1. engine/core/GameLoop.ts
```typescript
export class GameLoop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  readonly fixedTimestep = 1/60; // 60 FPS
  readonly maxSubSteps = 5;
  
  start(): void;
  stop(): void;
  tick(timestamp: number): void;
  protected abstract update(deltaTime: number): void;
  protected abstract draw(): void;
}
```
- Fixed timestep (16.67ms) with interpolation
- Handles browser tab visibility (pause when hidden)
- Returns deltaTime in seconds to update()

### 2. engine/core/Renderer.ts
```typescript
export class Renderer {
  constructor(canvas: HTMLCanvasElement);
  clear(colorIndex: 0|1|2|3): void;
  drawSprite(sprite: Sprite): void;
  drawTileMap(tileMap: TileMap): void;
  drawRect(x, y, w, h, colorIndex): void;
  drawText(text, x, y, colorIndex, fontSize?): void;
  getFramebuffer(): Uint8Array; // For save states
}
```
- 160×144 canvas, scaled via CSS
- DMG palette: [#9bbc0f, #8bac0f, #306230, #0f380f]
- Image rendering: pixelated (nearest neighbor)
- Scanline overlay via CSS (handled in UI)

### 3. engine/core/Input.ts
```typescript
export interface GamePadState {
  up: boolean; down: boolean; left: boolean; right: boolean;
  a: boolean; b: boolean; start: boolean; select: boolean;
}

export class Input {
  private state: GamePadState;
  private previousState: GamePadState;
  
  setButton(button: keyof GamePadState, pressed: boolean): void;
  getState(): Readonly<GamePadState>;
  isPressed(button): boolean;
  isJustPressed(button): boolean; // edge detection
  isJustReleased(button): boolean;
  update(): void; // call once per frame
}
```
- Keyboard mapping: Arrows=D-pad, Z=A, X=B, Enter=Start, Shift=Select
- Touch mapping: on-screen buttons
- Edge detection for "just pressed/released"

### 4. engine/core/Audio.ts
```typescript
export class Audio {
  private ctx: AudioContext;
  private masterGain: GainNode;
  
  playTone(frequency, duration, type='square', volume=0.3): void;
  playNoise(duration, volume=0.2): void;
  setMasterVolume(volume: number): void;
  resume(): void; // User gesture required
}
```
- Web Audio API (OscillatorNode for tones, noise buffer)
- Master volume control
- Auto-resume on first user interaction

### 5. engine/core/SaveState.ts
```typescript
export class SaveState {
  static save(gameId: string, state: unknown): void;
  static load(gameId: string): unknown | null;
  static delete(gameId: string): void;
  static list(): string[];
}
```
- localStorage with gameId prefix
- JSON serialization
- Version handling for future compatibility

## Tests
- GameLoop: fixed timestep accuracy, pause/resume
- Renderer: framebuffer size, color mapping
- Input: button state, edge detection
- Audio: context creation, volume
- SaveState: save/load roundtrip

## Verification
- `pnpm test` passes all core tests
- Canvas renders correctly at 160×144
- Input responds to keyboard/touch
- Audio plays on user interaction