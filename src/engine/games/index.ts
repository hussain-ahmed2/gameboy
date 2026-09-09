/**
 * @file index.ts
 * @description Public exports for the games module.
 */

export { gameRegistry, getGameInfo, createGame, getGameIds, getAllGames, type GameInfo } from './registry';
export { PongGame } from './pong/PongGame';
export { SnakeGame } from './snake/SnakeGame';
export { PlatformerGame } from './platformer/PlatformerGame';