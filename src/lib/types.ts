/**
 * @file types.ts
 * @description Shared TypeScript interfaces for the GameBoy game engine.
 *   Defines game pad state, sprite frames, tile types, and game interfaces.
 */

/** GameBoy button names */
export type GameBoyButton =
  | 'Up'
  | 'Down'
  | 'Left'
  | 'Right'
  | 'A'
  | 'B'
  | 'Start'
  | 'Select';

/** Current gamepad button states */
export interface GamePadState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  start: boolean;
  select: boolean;
}

/** Sprite animation frame */
export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  duration: number;
}

/** Color index for DMG palette */
export type ColorIndex = 0 | 1 | 2 | 3;

/** Tile definition for tilemaps */
export interface Tile {
  index: number;
  solid: boolean;
  colorIndex?: ColorIndex;
}

/** Game interface for the engine */
export interface Game {
  readonly gameId: string;
  init(): void;
  update(input: GamePadState, deltaTime: number): void;
  draw(renderer: Renderer): void;
  getScore(): number;
  getHighScore(): number;
  isGameOver(): boolean;
  saveState(): object;
  loadState(state: object): void;
  hasSaveState(): boolean;
  saveToStorage(): void;
  loadFromStorage(): boolean;
  onStart?(): void;
  onPause?(): void;
  onResume?(): void;
  onReset?(): void;
}

/** Renderer interface for drawing */
export interface Renderer {
  clear(colorIndex: ColorIndex): void;
  drawSprite(sprite: Sprite): void;
  drawTileMap(tileMap: TileMap): void;
  drawRect(x: number, y: number, w: number, h: number, colorIndex: ColorIndex): void;
  drawText(text: string, x: number, y: number, colorIndex?: ColorIndex): void;
  drawTextCentered(text: string, y: number, colorIndex?: ColorIndex): void;
  drawTextSmall(text: string, x: number, y: number, colorIndex?: ColorIndex): void;
  drawTextCenteredSmall(text: string, y: number, colorIndex?: ColorIndex): void;
  drawTextMedium(text: string, x: number, y: number, colorIndex?: ColorIndex): void;
  drawTextCenteredMedium(text: string, y: number, colorIndex?: ColorIndex): void;
  measureText(text: string): number;
  measureTextSmall(text: string): number;
  measureTextMedium(text: string): number;
  drawLine(x: number, y: number, length: number, colorIndex: ColorIndex): void;
  getFramebuffer(): Uint8Array;
}

/** Forward declarations for circular references */
export interface Sprite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  frames: SpriteFrame[];
  currentFrame: number;
  frameTimer: number;
  flipX: boolean;
  flipY: boolean;
  colorIndex: ColorIndex;
  visible: boolean;
  width: number;
  height: number;
  collidesWith(other: Sprite): boolean;
  update(deltaTime: number): void;
  draw(renderer: Renderer): void;
  setAnimation(frames: SpriteFrame[]): void;
}

export interface TileMap {
  width: number;
  height: number;
  tiles: Tile[][];
  tileSize: number;
  setTile(x: number, y: number, tile: Tile): void;
  getTile(x: number, y: number): Tile | null;
  checkCollision(x: number, y: number, w: number, h: number): boolean;
  draw(renderer: Renderer, cameraX?: number, cameraY?: number): void;
}

export interface Entity {
  x: number;
  y: number;
  components: Component[];
  tags: Set<string>;
  addComponent(component: Component): Entity;
  getComponent<T extends Component>(type: new () => T): T | null;
  update(deltaTime: number): void;
}

export interface Component {
  update(entity: Entity, deltaTime: number): void;
}

export interface SaveStateData {
  gameId: string;
  state: unknown;
  timestamp: number;
  version: number;
}