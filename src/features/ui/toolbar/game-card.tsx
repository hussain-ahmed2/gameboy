/**
 * @file game-card.tsx
 * @description Interactive game selection card with hover effects.
 *   Replaces the dropdown select for a fun, visual game picker.
 */

import { cn } from '@/lib/cn';

interface GameCardProps {
  /** Game ID */
  gameId: string;
  /** Game display name */
  name: string;
  /** Game description */
  description: string;
  /** Emoji icon for the game */
  icon: string;
  /** Whether this game is currently selected */
  isSelected: boolean;
  /** Callback when card is clicked */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function GameCard({
  name,
  description,
  icon,
  isSelected,
  onClick,
  className,
}: GameCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-1.5 p-3 rounded-xl',
        'font-pixel text-[7px] text-center',
        'transition-all duration-200 ease-out',
        'select-none cursor-pointer',
        'border-2',
        isSelected
          ? 'bg-accent/20 border-accent shadow-[0_0_16px_var(--accent-glow)] scale-105'
          : 'bg-shell-dark/30 border-transparent hover:bg-shell-dark/50 hover:border-shell-dark/50 hover:scale-102',
        className
      )}
      aria-label={`Select ${name}`}
    >
      <span className="text-2xl leading-none" role="img" aria-hidden="true">
        {icon}
      </span>
      <span
        className={cn(
          'transition-colors duration-200',
          isSelected ? 'text-accent' : 'text-white/80 group-hover:text-white'
        )}
      >
        {name}
      </span>
      <span className="text-[5px] text-white/40 leading-tight max-w-[80px]">
        {description}
      </span>
    </button>
  );
}
