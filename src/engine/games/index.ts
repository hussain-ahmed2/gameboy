/**
 * @file index.ts
 * @description Public exports for the games module.
 */

export { gameRegistry, getGameInfo, createGame, getGameIds, getAllGames, type GameInfo } from './registry';
export { PongGame } from './pong/PongGame';
export { SnakeGame } from './snake/SnakeGame';
export { PlatformerGame } from './platformer/PlatformerGame';
export { BreakoutGame } from './breakout/BreakoutGame';
export { FlappyGame } from './flappy/FlappyGame';
export { TetrisGame } from './tetris/TetrisGame';
export { InvaderGame } from './invaders/InvaderGame';
export { BombermanGame } from './bomberman/BombermanGame';
export { Snake2Game } from './snake2/Snake2Game';