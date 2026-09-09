/**
 * @file Sound.ts
 * @description Predefined game sound effects using the Audio engine.
 *   Simple one-liners for common game sounds.
 */

import { Audio } from '@/engine/core';

let audioInstance: Audio | null = null;

function getAudio(): Audio {
  if (!audioInstance) {
    audioInstance = new Audio();
  }
  return audioInstance;
}

/** Initialize audio (call on first user interaction) */
export function initAudio(): void {
  getAudio().resume();
}

/** Set master volume (0-1) */
export function setVolume(volume: number): void {
  getAudio().setMasterVolume(volume);
}

/** Play a quick beep */
export function beep(): void {
  getAudio().beep();
}

/** Play a boop sound */
export function boop(): void {
  getAudio().boop();
}

/** Play jump sound */
export function jump(): void {
  getAudio().jump();
}

/** Play coin collect sound */
export function coin(): void {
  getAudio().coin();
}

/** Play explosion sound */
export function explosion(): void {
  getAudio().explosion();
}

/** Play custom tone */
export function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.3
): void {
  getAudio().playTone(frequency, duration, type, volume);
}

/** Play noise */
export function playNoise(duration: number, volume = 0.2): void {
  getAudio().playNoise(duration, volume);
}