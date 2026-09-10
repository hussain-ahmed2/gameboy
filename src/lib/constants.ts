/**
 * @file constants.ts
 * @description Game engine constants: screen dimensions, color palette, key mapping.
 */

/** Screen dimensions in pixels (2x GameBoy DMG resolution) */
export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 288;

/** Original GameBoy resolution for game coordinate systems */
export const GAME_WIDTH = 160;
export const GAME_HEIGHT = 144;

/** HUD height in game pixels - non-playable zone at top for scores */
export const HUD_HEIGHT = 12;

/** UI font size: 8 = 8x8 font, 6 = 6x6 font, 4 = 4x4 font */
export const UI_FONT_SIZE = 8;
export const UI_FONT_SPACING = 1;

/** Target frame rate */
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP = 1 / TARGET_FPS; // ~16.67ms

/** DMG green palette colors (CSS hex values) */
export const DMG_PALETTE = ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'] as const;

/** Color indices for the DMG palette */
export type ColorIndex = 0 | 1 | 2 | 3;

/** Keyboard key to GameBoy button mapping */
export const KEY_MAP: Record<string, GameBoyButton> = {
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  z: 'A',
  x: 'B',
  Enter: 'Start',
  Shift: 'Select',
};

import type { GameBoyButton } from './types';

/** GameBoy button names (re-export for convenience) */
export type GameBoyButtonType = GameBoyButton;