# Plan: Game API

## Goal
Build the game development API: Game base class, Sprite, TileMap, Entity system, GamePad, and Sound.

## Files

### 1. engine/api/Game.ts
```typescript
export abstract class Game {
  protected renderer!: Renderer;
  protected input!: Input;
  protected audio!: Audio;
  
  abstract init(): void;
  abstract update(input: Input, deltaTime: number): void;
  abstract draw(renderer: Renderer): void;
  
  // Lifecycle hooks
  onStart(): void;
  onPause(): void;
  onResume(): void;
  onReset(): void;
}
```

### 2. engine/api/Sprite.ts
```typescript
export interface SpriteFrame {
  x: number; y: number; // source position in tileset
  w: number; h: number;
  duration: number; // ms per frame
}

export class Sprite {
  x: number; y: number;
  vx: number = 0; vy: number = 0;
  frames: SpriteFrame[] = [];
  currentFrame = 0;
  frameTimer = 0;
  flipX = false; flipY = false;
  colorIndex: 0|1|2|3 = 3;
  visible = true;
  
  constructor(config: { x: number; y: number; frames: SpriteFrame[] });
  update(deltaTime: number): void;
  draw(renderer: Renderer): void;
  setAnimation(frames: SpriteFrame[]): void;
}
```
- Position, velocity
- Frame-based animation with duration
- Flip X/Y, color palette index
- Bounds checking

### 3. engine/api/TileMap.ts
```typescript
export interface Tile {
  index: number; // tile index in tileset
  solid: boolean; // collision
  colorIndex?: 0|1|2|3;
}

export class TileMap {
  width: number; height: number; // in tiles
  tiles: Tile[][] = [];
  tileSize = 8;
  tileset: HTMLImageElement | OffscreenCanvas;
  
  constructor(config: { width: number; height: number; tileSize?: number });
  setTile(x, y, tile: Tile): void;
  getTile(x, y): Tile | null;
  checkCollision(x, y, w, h): boolean;
  draw(renderer: Renderer, cameraX=0, cameraY=0): void;
}
```
- 2D grid of tiles
- Collision detection (solid tiles)
- Camera offset for scrolling
- Tileset as image or generated canvas

### 4. engine/api/Entity.ts
```typescript
export interface Component {
  update(entity: Entity, deltaTime: number): void;
}

export class Entity {
  x: number; y: number;
  components: Component[] = [];
  tags: Set<string> = new Set();
  
  addComponent(component: Component): this;
  getComponent<T extends Component>(type: new() => T): T | null;
  update(deltaTime: number): void;
}
```
- Component-based architecture
- Tags for grouping/finding entities
- Simple, no ECS framework overhead

### 5. engine/api/GamePad.ts
```typescript
// Re-export from Input
export type GamePadState = Input['getState'] extends () => infer T ? T : never;
export const Button = { Up: 'up', Down: 'down', Left: 'left', Right: 'right', A: 'a', B: 'b', Start: 'start', Select: 'select' } as const;
```

### 6. engine/api/Sound.ts
```typescript
export class Sound {
  static beep(frequency: number, duration: number): void;
  static boop(): void; // confirmation sound
  static explosion(): void;
  static jump(): void;
  static coin(): void;
}
```
- Predefined game sounds using Audio class
- Easy one-liners for common effects

## Tests
- Game: lifecycle hooks called correctly
- Sprite: animation timing, position update
- TileMap: collision detection, tile setting
- Entity: component add/get/update
- Sound: plays without errors

## Verification
- `pnpm test` passes all API tests
- Can create a simple game using the API