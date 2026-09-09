/**
 * @file game-info.tsx
 * @description Displays the current game's name.
 */

import { cn } from '@/lib/cn';
import { getGameInfo } from '@/engine/games';

interface GameInfoProps {
  /** Current game ID */
  gameId: string;
  /** Additional CSS classes */
  className?: string;
}

export function GameInfo({ gameId, className }: GameInfoProps) {
  const info = getGameInfo(gameId);
  if (!info) return null;

  return (
    <div
      data-testid="game-info"
      className={cn(
        'font-pixel text-[8px] text-shell-dark text-center',
        className
      )}
    >
      {info.name}
    </div>
  );
}