/**
 * @file registry.ts
 * @description Game registry - central list of built-in games.
 */

import type { Game } from '@/engine/api';
import { PongGame } from './pong/PongGame';
import { SnakeGame } from './snake/SnakeGame';
import { PlatformerGame } from './platformer/PlatformerGame';

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