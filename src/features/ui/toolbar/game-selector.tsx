/**
 * @file game-selector.tsx
 * @description Dropdown to switch between built-in games.
 */

import { cn } from '@/lib/cn';
import { getAllGames } from '@/engine/games';

interface GameSelectorProps {
  /** Currently selected game ID */
  currentGame: string;
  /** Callback when game selection changes */
  onChange: (gameId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export function GameSelector({ currentGame, onChange, className }: GameSelectorProps) {
  const games = getAllGames();

  return (
    <select
      value={currentGame}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'px-3 py-2 bg-lcd-dark text-lcd-light font-pixel text-[8px] rounded',
        'border border-bezel focus:outline-none focus:ring-2 focus:ring-lcd-med',
        className
      )}
      aria-label="Select game"
    >
      {games.map((game) => (
        <option key={game.id} value={game.id}>
          {game.name}
        </option>
      ))}
    </select>
  );
}