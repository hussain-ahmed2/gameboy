/**
 * @file game-selector.tsx
 * @description Interactive game selector using visual cards
 *   instead of a dropdown. Displays game icons with hover effects.
 */

import { cn } from '@/lib/cn';
import { getAllGames } from '@/engine/games';
import { GameCard } from './game-card';

const GAME_ICONS: Record<string, string> = {
  pong: '\u{1F3D3}',
  snake: '\u{1F40D}',
  platformer: '\u{1F3C3}',
};

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
    <div
      className={cn('flex items-center gap-3', className)}
      role="radiogroup"
      aria-label="Select game"
    >
      {games.map((game) => (
        <GameCard
          key={game.id}
          gameId={game.id}
          name={game.name}
          description={game.description}
          icon={GAME_ICONS[game.id] || '\u{1F3AE}'}
          isSelected={currentGame === game.id}
          onClick={() => onChange(game.id)}
        />
      ))}
    </div>
  );
}
