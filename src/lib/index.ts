/**
 * @file index.ts
 * @description Public exports for the lib module.
 */

export type {
  GameBoyButton,
  GamePadState,
  SpriteFrame,
  Tile,
  Game,
  Renderer,
  Sprite,
  TileMap,
  Entity,
  Component,
  SaveStateData,
} from './types';

export {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  TARGET_FPS,
  FIXED_TIMESTEP,
  DMG_PALETTE,
  KEY_MAP,
  type ColorIndex,
} from './constants';

export {
  getBit,
  setBit,
  clearBit,
  bitValue,
  hiByte,
  loByte,
  toWord,
  swapNibbles,
  toByte,
  toWord16,
} from './bit-utils';

export { cn } from './cn';