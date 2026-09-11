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

export type DisplayMode = 'dmg' | 'pocket' | 'light';

export const DISPLAY_MODES: { id: DisplayMode; label: string }[] = [
  { id: 'dmg', label: 'ANALOGUE GB (DMG)' },
  { id: 'pocket', label: 'ANALOGUE POCKET (B&W)' },
  { id: 'light', label: 'ANALOGUE LIGHT (TEAL)' },
];

/** Multi-display color palettes */
export const DISPLAY_PALETTES: Record<DisplayMode, readonly [string, string, string, string]> = {
  dmg: ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'], // Authentic DMG pea-soup green
  pocket: ['#e4ebe3', '#9ca49b', '#4e554d', '#131812'], // Crisp Game Boy Pocket monochrome
  light: ['#5ae2b5', '#24b988', '#11684c', '#062d20'], // Electroluminescent Game Boy Light teal
};

function hexToUint32(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (255 << 24) | (b << 16) | (g << 8) | r;
}

/** Pre-computed 32-bit ABGR values for direct zero-allocation canvas blits */
export const DISPLAY_PALETTES_UINT32: Record<DisplayMode, Uint32Array> = {
  dmg: new Uint32Array(DISPLAY_PALETTES.dmg.map(hexToUint32)),
  pocket: new Uint32Array(DISPLAY_PALETTES.pocket.map(hexToUint32)),
  light: new Uint32Array(DISPLAY_PALETTES.light.map(hexToUint32)),
};

/** DMG green palette colors (CSS hex values) - defaults to DMG */
export const DMG_PALETTE = DISPLAY_PALETTES.dmg;

/** Color indices for the palette (0 = lightest/bg, 3 = darkest/fg) */
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