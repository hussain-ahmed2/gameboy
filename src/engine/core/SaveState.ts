/**
 * @file SaveState.ts
 * @description Save state persistence using localStorage.
 *   Handles serialization, versioning, and game-specific storage.
 */

import type { SaveStateData } from '@/lib/types';

const STORAGE_PREFIX = 'gameboy_engine_';
const SAVE_VERSION = 1;

export class SaveState {
  /** Save game state to localStorage */
  static save(gameId: string, state: unknown): void {
    try {
      const data: SaveStateData = {
        gameId,
        state,
        timestamp: Date.now(),
        version: SAVE_VERSION,
      };
      localStorage.setItem(`${STORAGE_PREFIX}${gameId}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  /** Load game state from localStorage */
  static load(gameId: string): unknown | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${gameId}`);
      if (!raw) return null;

      const data: SaveStateData = JSON.parse(raw);
      
      // Version check - migrate if needed
      if (data.version !== SAVE_VERSION) {
        console.warn(`Save version mismatch for ${gameId}, ignoring`);
        return null;
      }

      return data.state;
    } catch (e) {
      console.warn('Failed to load state:', e);
      return null;
    }
  }

  /** Delete save state for a game */
  static delete(gameId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${gameId}`);
    } catch (e) {
      console.warn('Failed to delete state:', e);
    }
  }

  /** List all saved game IDs */
  static list(): string[] {
    const saves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        saves.push(key.slice(STORAGE_PREFIX.length));
      }
    }
    return saves;
  }

  /** Clear all save states */
  static clearAll(): void {
    const keys = SaveState.list();
    keys.forEach((id) => SaveState.delete(id));
  }
}