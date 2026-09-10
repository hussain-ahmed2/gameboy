/**
 * @file registry.ts
 * @description Game registry - central list of built-in games.
 */

import type { Game } from '@/engine/api';
import { PongGame } from './pong/PongGame';
import { SnakeGame } from './snake/SnakeGame';
import { PlatformerGame } from './platformer/PlatformerGame';
import { BreakoutGame } from './breakout/BreakoutGame';
import { FlappyGame } from './flappy/FlappyGame';
import { TetrisGame } from './tetris/TetrisGame';
import { InvaderGame } from './invaders/InvaderGame';
import { BombermanGame } from './bomberman/BombermanGame';
import { Snake2Game } from './snake2/Snake2Game';

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  create: () => Game;
}

export const gameRegistry: GameInfo[] = [
  {
    id: 'pong',
    name: 'PONG',
    description: 'Classic paddle game - score 11 to win',
    create: () => new PongGame(),
  },
  {
    id: 'snake',
    name: 'SNAKE',
    description: 'Eat food, grow, avoid walls and yourself',
    create: () => new SnakeGame(),
  },
  {
    id: 'platformer',
    name: 'PLATFORMER',
    description: 'Jump, collect coins, reach the flag',
    create: () => new PlatformerGame(),
  },
  {
    id: 'breakout',
    name: 'BREAKOUT',
    description: 'Break all the bricks with the ball',
    create: () => new BreakoutGame(),
  },
  {
    id: 'flappy',
    name: 'FLAPPY',
    description: 'Tap to flap, avoid pipes, score points',
    create: () => new FlappyGame(),
  },
  {
    id: 'invaders',
    name: 'INVADERS',
    description: 'Defend Earth from alien invaders',
    create: () => new InvaderGame(),
  },
  {
    id: 'bomberman',
    name: 'BOMBERMAN',
    description: 'Place bombs, destroy blocks, find the exit',
    create: () => new BombermanGame(),
  },
  {
    id: 'tetris',
    name: 'TETRIS',
    description: 'Stack tetrominoes, clear lines, score points',
    create: () => new TetrisGame(),
  },
  {
    id: 'snake2',
    name: 'SNAKE II',
    description: 'Enhanced snake with portals and power-ups',
    create: () => new Snake2Game(),
  },
];

/** Get game info by ID */
export function getGameInfo(id: string): GameInfo | undefined {
  return gameRegistry.find(g => g.id === id);
}

/** Create game instance by ID */
export function createGame(id: string): Game | null {
  const info = getGameInfo(id);
  return info ? info.create() : null;
}

/** Get all game IDs */
export function getGameIds(): string[] {
  return gameRegistry.map(g => g.id);
}

/** Get all game info for UI */
export function getAllGames(): GameInfo[] {
  return [...gameRegistry];
}