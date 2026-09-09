/**
 * @file gameboy-shell.tsx
 * @description Main GameBoy DMG shell wrapper component.
 *   Renders the grey brick body with rounded corners, screen bezel,
 *   label, speaker, and control area.
 */

import { ShellLabel } from './shell-label';
import { ShellSpeaker } from './shell-speaker';
import { cn } from '@/lib/cn';

interface GameBoyShellProps {
  /** Whether the game is running (controls LED) */
  isRunning?: boolean;
  /** Child elements rendered inside the shell */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function GameBoyShell({ isRunning = false, children, className }: GameBoyShellProps) {
  return (
    <div
      data-testid="gameboy-shell"
      className={cn(
        'relative flex flex-col',
        'bg-shell rounded-[24px] p-6 pb-8',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]',
        'w-[320px] max-w-full',
        className
      )}
    >
      {/* Power LED */}
      <div className="absolute top-3 right-4">
        <div
          data-testid="power-led"
          className={cn(
            'w-2 h-2 rounded-full',
            isRunning ? 'bg-led shadow-[0_0_8px_#ff0000]' : 'bg-shell-dark'
          )}
        />
      </div>

      {/* Top label */}
      <ShellLabel />

      {/* Screen area */}
      <div className="mt-4">
        {children}
      </div>

      {/* Bottom area: speaker + brand text */}
      <div className="mt-4 flex items-center justify-between">
        <p className="font-pixel text-[7px] text-shell-dark opacity-60">
          Nintendo
        </p>
        <ShellSpeaker />
      </div>
    </div>
  );
}