/**
 * @file BitmapFont.ts
 * @description 8x8 pixel bitmap font for GameBoy LCD rendering.
 *   Each character is defined as 8 bytes, where each byte represents
 *   one row of pixels (MSB = leftmost pixel).
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@/lib/constants';

/** Font character data - 8 bytes per character (8x8 pixels) */
const FONT_DATA: Record<string, number[]> = {
  'A': [0x3C, 0x66, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00],
  'B': [0x7C, 0x66, 0x66, 0x7C, 0x66, 0x66, 0x7C, 0x00],
  'C': [0x3C, 0x66, 0x60, 0x60, 0x60, 0x66, 0x3C, 0x00],
  'D': [0x78, 0x6C, 0x66, 0x66, 0x66, 0x6C, 0x78, 0x00],
  'E': [0x7E, 0x60, 0x60, 0x78, 0x60, 0x60, 0x7E, 0x00],
  'F': [0x7E, 0x60, 0x60, 0x78, 0x60, 0x60, 0x60, 0x00],
  'G': [0x3C, 0x66, 0x60, 0x6E, 0x66, 0x66, 0x3C, 0x00],
  'H': [0x66, 0x66, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00],
  'I': [0x3C, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00],
  'J': [0x1E, 0x0C, 0x0C, 0x0C, 0x0C, 0x6C, 0x38, 0x00],
  'K': [0x66, 0x6C, 0x78, 0x70, 0x78, 0x6C, 0x66, 0x00],
  'L': [0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x7E, 0x00],
  'M': [0x63, 0x77, 0x7F, 0x6B, 0x63, 0x63, 0x63, 0x00],
  'N': [0x66, 0x76, 0x7E, 0x7E, 0x6E, 0x66, 0x66, 0x00],
  'O': [0x3C, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x00],
  'P': [0x7C, 0x66, 0x66, 0x7C, 0x60, 0x60, 0x60, 0x00],
  'Q': [0x3C, 0x66, 0x66, 0x66, 0x66, 0x6C, 0x36, 0x00],
  'R': [0x7C, 0x66, 0x66, 0x7C, 0x78, 0x6C, 0x66, 0x00],
  'S': [0x3C, 0x66, 0x60, 0x3C, 0x06, 0x66, 0x3C, 0x00],
  'T': [0x7E, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00],
  'U': [0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x00],
  'V': [0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x00],
  'W': [0x63, 0x63, 0x63, 0x6B, 0x7F, 0x77, 0x63, 0x00],
  'X': [0x66, 0x66, 0x3C, 0x18, 0x3C, 0x66, 0x66, 0x00],
  'Y': [0x66, 0x66, 0x66, 0x3C, 0x18, 0x18, 0x18, 0x00],
  'Z': [0x7E, 0x06, 0x0C, 0x18, 0x30, 0x60, 0x7E, 0x00],
  '0': [0x3C, 0x66, 0x6E, 0x76, 0x66, 0x66, 0x3C, 0x00],
  '1': [0x18, 0x38, 0x18, 0x18, 0x18, 0x18, 0x7E, 0x00],
  '2': [0x3C, 0x66, 0x06, 0x0C, 0x30, 0x60, 0x7E, 0x00],
  '3': [0x3C, 0x66, 0x06, 0x1C, 0x06, 0x66, 0x3C, 0x00],
  '4': [0x0C, 0x1C, 0x3C, 0x6C, 0x7E, 0x0C, 0x0C, 0x00],
  '5': [0x7E, 0x60, 0x7C, 0x06, 0x06, 0x66, 0x3C, 0x00],
  '6': [0x3C, 0x66, 0x60, 0x7C, 0x66, 0x66, 0x3C, 0x00],
  '7': [0x7E, 0x66, 0x0C, 0x18, 0x18, 0x18, 0x18, 0x00],
  '8': [0x3C, 0x66, 0x66, 0x3C, 0x66, 0x66, 0x3C, 0x00],
  '9': [0x3C, 0x66, 0x66, 0x3E, 0x06, 0x66, 0x3C, 0x00],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '!': [0x18, 0x18, 0x18, 0x18, 0x00, 0x18, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00],
  ':': [0x00, 0x18, 0x18, 0x00, 0x18, 0x18, 0x00, 0x00],
  '-': [0x00, 0x00, 0x00, 0x7E, 0x00, 0x00, 0x00, 0x00],
  '>': [0x60, 0x30, 0x18, 0x0C, 0x18, 0x30, 0x60, 0x00],
  '<': [0x06, 0x0C, 0x18, 0x30, 0x18, 0x0C, 0x06, 0x00],
  '/': [0x02, 0x06, 0x0C, 0x18, 0x30, 0x60, 0x40, 0x00],
  ',': [0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x30, 0x00],
  '\'': [0x18, 0x18, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00],
  '"': [0x6C, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '(': [0x0C, 0x18, 0x30, 0x30, 0x30, 0x18, 0x0C, 0x00],
  ')': [0x30, 0x18, 0x0C, 0x0C, 0x0C, 0x18, 0x30, 0x00],
  '=': [0x00, 0x00, 0x7E, 0x00, 0x7E, 0x00, 0x00, 0x00],
  '+': [0x00, 0x18, 0x18, 0x7E, 0x18, 0x18, 0x00, 0x00],
  '*': [0x00, 0x66, 0x3C, 0xFF, 0x3C, 0x66, 0x00, 0x00],
  '#': [0x6C, 0x6C, 0xFE, 0x6C, 0xFE, 0x6C, 0x6C, 0x00],
  '@': [0x3C, 0x66, 0x6E, 0x6A, 0x6E, 0x60, 0x3E, 0x00],
  '$': [0x18, 0x3E, 0x60, 0x3C, 0x06, 0x7C, 0x18, 0x00],
  '%': [0x62, 0x66, 0x0C, 0x18, 0x30, 0x66, 0x46, 0x00],
  '&': [0x3C, 0x66, 0x3C, 0x38, 0x67, 0x66, 0x3F, 0x00],
  '_': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x00],
  'a': [0x00, 0x00, 0x3C, 0x06, 0x3E, 0x66, 0x3E, 0x00],
  'b': [0x60, 0x60, 0x7C, 0x66, 0x66, 0x66, 0x7C, 0x00],
  'c': [0x00, 0x00, 0x3C, 0x66, 0x60, 0x66, 0x3C, 0x00],
  'd': [0x06, 0x06, 0x3E, 0x66, 0x66, 0x66, 0x3E, 0x00],
  'e': [0x00, 0x00, 0x3C, 0x66, 0x7E, 0x60, 0x3C, 0x00],
  'f': [0x1C, 0x36, 0x30, 0x7C, 0x30, 0x30, 0x30, 0x00],
  'g': [0x00, 0x00, 0x3E, 0x66, 0x66, 0x3E, 0x06, 0x7C],
  'h': [0x60, 0x60, 0x7C, 0x66, 0x66, 0x66, 0x66, 0x00],
  'i': [0x18, 0x00, 0x38, 0x18, 0x18, 0x18, 0x3C, 0x00],
  'j': [0x06, 0x00, 0x06, 0x06, 0x06, 0x66, 0x66, 0x3C],
  'k': [0x60, 0x60, 0x66, 0x6C, 0x78, 0x6C, 0x66, 0x00],
  'l': [0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00],
  'm': [0x00, 0x00, 0x66, 0x7F, 0x7F, 0x6B, 0x63, 0x00],
  'n': [0x00, 0x00, 0x7C, 0x66, 0x66, 0x66, 0x66, 0x00],
  'o': [0x00, 0x00, 0x3C, 0x66, 0x66, 0x66, 0x3C, 0x00],
  'p': [0x00, 0x00, 0x7C, 0x66, 0x66, 0x7C, 0x60, 0x60],
  'q': [0x00, 0x00, 0x3E, 0x66, 0x66, 0x3E, 0x06, 0x06],
  'r': [0x00, 0x00, 0x7C, 0x66, 0x60, 0x60, 0x60, 0x00],
  's': [0x00, 0x00, 0x3E, 0x60, 0x3C, 0x06, 0x7C, 0x00],
  't': [0x30, 0x30, 0x7C, 0x30, 0x30, 0x36, 0x1C, 0x00],
  'u': [0x00, 0x00, 0x66, 0x66, 0x66, 0x66, 0x3E, 0x00],
  'v': [0x00, 0x00, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x00],
  'w': [0x00, 0x00, 0x63, 0x6B, 0x7F, 0x7F, 0x36, 0x00],
  'x': [0x00, 0x00, 0x66, 0x3C, 0x18, 0x3C, 0x66, 0x00],
  'y': [0x00, 0x00, 0x66, 0x66, 0x66, 0x3E, 0x06, 0x7C],
  'z': [0x00, 0x00, 0x7E, 0x0C, 0x18, 0x30, 0x7E, 0x00],
};

/** Character width in pixels */
export const CHAR_WIDTH = 8;

/** Character height in pixels */
export const CHAR_HEIGHT = 8;

/** Spacing between characters in pixels */
export const CHAR_SPACING = 1;

/** Small font character width in pixels */
export const SMALL_CHAR_WIDTH = 4;

/** Small font character height in pixels */
export const SMALL_CHAR_HEIGHT = 4;

/** Small font spacing between characters in pixels */
export const SMALL_CHAR_SPACING = 1;

/**
 * Generate a 4x4 small font from the 8x8 data by sampling every other pixel.
 */
function buildSmallFont(): Record<string, number[]> {
  const small: Record<string, number[]> = {};
  for (const [ch, data] of Object.entries(FONT_DATA)) {
    const rows: number[] = [];
    for (let r = 0; r < 4; r++) {
      const byte8 = data[r * 2];
      // Take bits 7,5,3,1 from the 8x8 row → 4 pixels in a 4-bit nibble
      const b7 = (byte8 >> 7) & 1;
      const b5 = (byte8 >> 5) & 1;
      const b3 = (byte8 >> 3) & 1;
      const b1 = (byte8 >> 1) & 1;
      rows.push((b7 << 3) | (b5 << 2) | (b3 << 1) | b1);
    }
    small[ch] = rows;
  }
  return small;
}

const SMALL_FONT_DATA = buildSmallFont();

/** Medium font character width in pixels */
export const MED_CHAR_WIDTH = 6;

/** Medium font character height in pixels */
export const MED_CHAR_HEIGHT = 6;

/** Medium font spacing between characters in pixels */
export const MED_CHAR_SPACING = 1;

/**
 * Generate a 6x6 medium font from the 8x8 data.
 * Takes first 6 rows, middle 6 columns (bits 6..1).
 */
function buildMediumFont(): Record<string, number[]> {
  const med: Record<string, number[]> = {};
  for (const [ch, data] of Object.entries(FONT_DATA)) {
    const rows: number[] = [];
    for (let r = 0; r < 6; r++) {
      const byte8 = data[r];
      // Extract bits 6,5,4,3,2,1 → 6 pixels stored in bits 5..0
      const b6 = (byte8 >> 6) & 1;
      const b5 = (byte8 >> 5) & 1;
      const b4 = (byte8 >> 4) & 1;
      const b3 = (byte8 >> 3) & 1;
      const b2 = (byte8 >> 2) & 1;
      const b1 = (byte8 >> 1) & 1;
      rows.push((b6 << 5) | (b5 << 4) | (b4 << 3) | (b3 << 2) | (b2 << 1) | b1);
    }
    med[ch] = rows;
  }
  return med;
}

const MED_FONT_DATA = buildMediumFont();

/**
 * Get the pixel data for a character.
 * @param char - Character to get data for
 * @returns Array of 8 bytes, or null if character not found
 */
export function getCharData(char: string): number[] | null {
  const upper = char.toUpperCase();
  return FONT_DATA[upper] ?? FONT_DATA[char] ?? null;
}

/**
 * Measure the width of a string in pixels.
 * @param text - String to measure
 * @returns Width in pixels
 */
export function measureText(text: string): number {
  return text.length * (CHAR_WIDTH + CHAR_SPACING) - CHAR_SPACING;
}

/**
 * Draw a single character to a framebuffer at the given position.
 * @param framebuffer - Target framebuffer (160x144)
 * @param char - Character to draw
 * @param x - X position (left edge)
 * @param y - Y position (top edge)
 * @param colorIndex - Color index (0-3)
 * @returns true if character was drawn, false if not found
 */
export function drawChar(
  framebuffer: Uint8Array,
  char: string,
  x: number,
  y: number,
  colorIndex: number = 3
): boolean {
  const data = getCharData(char);
  if (!data) return false;

  const screenW = SCREEN_WIDTH;
  const screenH = SCREEN_HEIGHT;

  for (let row = 0; row < CHAR_HEIGHT; row++) {
    const byte = data[row];
    for (let col = 0; col < CHAR_WIDTH; col++) {
      // Check if bit is set (MSB first)
      if (byte & (0x80 >> col)) {
        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < screenW && py >= 0 && py < screenH) {
          framebuffer[py * screenW + px] = colorIndex;
        }
      }
    }
  }

  return true;
}

/**
 * Draw a string of text to a framebuffer.
 * @param framebuffer - Target framebuffer (160x144)
 * @param text - String to draw
 * @param x - Starting X position
 * @param y - Starting Y position
 * @param colorIndex - Color index (0-3)
 * @returns Width drawn in pixels
 */
export function drawText(
  framebuffer: Uint8Array,
  text: string,
  x: number,
  y: number,
  colorIndex: number = 3
): number {
  let cursorX = x;
  for (const char of text) {
    drawChar(framebuffer, char, cursorX, y, colorIndex);
    cursorX += CHAR_WIDTH + CHAR_SPACING;
  }
  return cursorX - x;
}

/**
 * Draw centered text on a framebuffer.
 * @param framebuffer - Target framebuffer (160x144)
 * @param text - String to draw
 * @param y - Y position
 * @param colorIndex - Color index (0-3)
 * @param maxWidth - Maximum width to center within (default: 160)
 */
export function drawTextCentered(
  framebuffer: Uint8Array,
  text: string,
  y: number,
  colorIndex: number = 3,
  maxWidth: number = SCREEN_WIDTH
): void {
  const textWidth = measureText(text);
  const x = Math.floor((maxWidth - textWidth) / 2);
  drawText(framebuffer, text, x, y, colorIndex);
}

/**
 * Draw a filled rectangle on the framebuffer.
 */
export function drawRect(
  framebuffer: Uint8Array,
  x: number,
  y: number,
  w: number,
  h: number,
  colorIndex: number
): void {
  const screenW = SCREEN_WIDTH;
  const screenH = SCREEN_HEIGHT;
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(screenW, Math.floor(x) + Math.ceil(w));
  const endY = Math.min(screenH, Math.floor(y) + Math.ceil(h));

  for (let py = startY; py < endY; py++) {
    const base = py * screenW;
    for (let px = startX; px < endX; px++) {
      framebuffer[base + px] = colorIndex;
    }
  }
}

/**
 * Draw a selection highlight bar on the framebuffer.
 */
export function drawHighlight(
  framebuffer: Uint8Array,
  x: number,
  y: number,
  w: number,
  h: number,
  bgColor: number = 3,
): void {
  drawRect(framebuffer, x, y, w, h, bgColor);
}

/**
 * Draw a horizontal line on the framebuffer.
 */
export function drawLine(
  framebuffer: Uint8Array,
  x: number,
  y: number,
  length: number,
  colorIndex: number
): void {
  drawRect(framebuffer, x, y, length, 1, colorIndex);
}

/**
 * Draw a single small (4x4) character to a framebuffer.
 */
export function drawCharSmall(
  framebuffer: Uint8Array,
  char: string,
  x: number,
  y: number,
  colorIndex: number = 3
): boolean {
  const upper = char.toUpperCase();
  const data = SMALL_FONT_DATA[upper] ?? SMALL_FONT_DATA[char] ?? null;
  if (!data) return false;

  const screenW = SCREEN_WIDTH;
  const screenH = SCREEN_HEIGHT;

  for (let row = 0; row < SMALL_CHAR_HEIGHT; row++) {
    const byte = data[row];
    for (let col = 0; col < SMALL_CHAR_WIDTH; col++) {
      if (byte & (0x08 >> col)) {
        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < screenW && py >= 0 && py < screenH) {
          framebuffer[py * screenW + px] = colorIndex;
        }
      }
    }
  }
  return true;
}

/**
 * Measure the width of a small text string in pixels.
 */
export function measureTextSmall(text: string): number {
  return text.length * (SMALL_CHAR_WIDTH + SMALL_CHAR_SPACING) - SMALL_CHAR_SPACING;
}

/**
 * Draw a string of small (4x4) text to a framebuffer.
 */
export function drawTextSmall(
  framebuffer: Uint8Array,
  text: string,
  x: number,
  y: number,
  colorIndex: number = 3
): number {
  let cursorX = x;
  for (const char of text) {
    drawCharSmall(framebuffer, char, cursorX, y, colorIndex);
    cursorX += SMALL_CHAR_WIDTH + SMALL_CHAR_SPACING;
  }
  return cursorX - x;
}

/**
 * Draw centered small (4x4) text on a framebuffer.
 */
export function drawTextCenteredSmall(
  framebuffer: Uint8Array,
  text: string,
  y: number,
  colorIndex: number = 3,
  maxWidth: number = SCREEN_WIDTH
): void {
  const textWidth = measureTextSmall(text);
  const x = Math.floor((maxWidth - textWidth) / 2);
  drawTextSmall(framebuffer, text, x, y, colorIndex);
}

/**
 * Draw a single medium (6x6) character to a framebuffer.
 */
export function drawCharMedium(
  framebuffer: Uint8Array,
  char: string,
  x: number,
  y: number,
  colorIndex: number = 3
): boolean {
  const upper = char.toUpperCase();
  const data = MED_FONT_DATA[upper] ?? MED_FONT_DATA[char] ?? null;
  if (!data) return false;

  const screenW = SCREEN_WIDTH;
  const screenH = SCREEN_HEIGHT;

  for (let row = 0; row < MED_CHAR_HEIGHT; row++) {
    const byte = data[row];
    for (let col = 0; col < MED_CHAR_WIDTH; col++) {
      if (byte & (0x20 >> col)) {
        const px = x + col;
        const py = y + row;
        if (px >= 0 && px < screenW && py >= 0 && py < screenH) {
          framebuffer[py * screenW + px] = colorIndex;
        }
      }
    }
  }
  return true;
}

/**
 * Measure the width of a medium text string in pixels.
 */
export function measureTextMedium(text: string): number {
  return text.length * (MED_CHAR_WIDTH + MED_CHAR_SPACING) - MED_CHAR_SPACING;
}

/**
 * Draw a string of medium (6x6) text to a framebuffer.
 */
export function drawTextMedium(
  framebuffer: Uint8Array,
  text: string,
  x: number,
  y: number,
  colorIndex: number = 3
): number {
  let cursorX = x;
  for (const char of text) {
    drawCharMedium(framebuffer, char, cursorX, y, colorIndex);
    cursorX += MED_CHAR_WIDTH + MED_CHAR_SPACING;
  }
  return cursorX - x;
}

/**
 * Draw centered medium (6x6) text on a framebuffer.
 */
export function drawTextCenteredMedium(
  framebuffer: Uint8Array,
  text: string,
  y: number,
  colorIndex: number = 3,
  maxWidth: number = SCREEN_WIDTH
): void {
  const textWidth = measureTextMedium(text);
  const x = Math.floor((maxWidth - textWidth) / 2);
  drawTextMedium(framebuffer, text, x, y, colorIndex);
}
