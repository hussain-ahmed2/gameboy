/**
 * @file index.ts
 * @description Public exports for the game API module.
 */

export { Game } from './Game';
export { Sprite } from './Sprite';
export { TileMap } from './TileMap';
export { Entity } from './Entity';
export { Button, DirectionButtons, ActionButtons, MetaButtons, AllButtons, anyDirectionPressed, getDirectionVector, type GamePadState } from './GamePad';
export { initAudio, setVolume, beep, boop, jump, coin, explosion, playTone, playNoise } from './Sound';