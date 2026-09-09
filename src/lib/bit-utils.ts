/**
 * @file bit-utils.ts
 * @description Bit manipulation utilities for the game engine.
 */

/**
 * Get the value of a specific bit (0 or 1).
 * @param value - The byte to read from
 * @param bit - Bit position (0-7, where 0 is LSB)
 * @returns true if the bit is set, false otherwise
 */
export function getBit(value: number, bit: number): boolean {
  return ((value >> bit) & 1) === 1;
}

/**
 * Set a specific bit to 1.
 * @param value - The byte to modify
 * @param bit - Bit position (0-7)
 * @returns The byte with the specified bit set
 */
export function setBit(value: number, bit: number): number {
  return value | (1 << bit);
}

/**
 * Clear a specific bit to 0.
 * @param value - The byte to modify
 * @param bit - Bit position (0-7)
 * @returns The byte with the specified bit cleared
 */
export function clearBit(value: number, bit: number): number {
  return value & ~(1 << bit);
}

/**
 * Get 2^bit as a number.
 * @param bit - The exponent (0-7)
 * @returns 2 raised to the power of bit
 */
export function bitValue(bit: number): number {
  return 1 << bit;
}

/**
 * Extract the high byte (bits 8-15) from a 16-bit word.
 * @param word - The 16-bit value
 * @returns High byte (0-255)
 */
export function hiByte(word: number): number {
  return (word >> 8) & 0xff;
}

/**
 * Extract the low byte (bits 0-7) from a 16-bit word.
 * @param word - The 16-bit value
 * @returns Low byte (0-255)
 */
export function loByte(word: number): number {
  return word & 0xff;
}

/**
 * Combine high and low bytes into a 16-bit word.
 * @param hi - High byte (bits 8-15)
 * @param lo - Low byte (bits 0-7)
 * @returns 16-bit word
 */
export function toWord(hi: number, lo: number): number {
  return ((hi & 0xff) << 8) | (lo & 0xff);
}

/**
 * Swap the upper and lower nibbles of a byte.
 * @param value - The byte to swap
 * @returns Byte with nibbles swapped
 */
export function swapNibbles(value: number): number {
  return ((value & 0x0f) << 4) | ((value & 0xf0) >> 4);
}

/**
 * Clamp a value to an unsigned byte (0-255).
 * @param value - The value to clamp
 * @returns Clamped byte value
 */
export function toByte(value: number): number {
  return value & 0xff;
}

/**
 * Clamp a value to an unsigned word (0-65535).
 * @param value - The value to clamp
 * @returns Clamped word value
 */
export function toWord16(value: number): number {
  return value & 0xffff;
}