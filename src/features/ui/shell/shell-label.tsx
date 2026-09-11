/**
 * @file shell-label.tsx
 * @description Renders the "DOT MATRIX WITH STEREO SOUND" label
 *   at the top of the GameBoy shell.
 */

import { cn } from "@/lib/cn";

interface ShellLabelProps {
  isRunning?: boolean;
  isPaused?: boolean;
}

export function ShellLabel({ isRunning = false, isPaused = false }: ShellLabelProps) {
  return (
    <div className="flex items-center justify-center px-1.5 select-none">
      {/* Hardware Audio Spec & Power Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          data-testid="power-led"
          title={isRunning ? "System Active" : isPaused ? "System Paused" : "System Standby"}
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            isRunning && !isPaused
              ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
              : isPaused
                ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                : "bg-white/20",
          )}
        />
        <p className="font-sans font-bold text-[8px] tracking-[0.14em] text-white/40 uppercase">
          DOT MATRIX WITH STEREO SOUND
        </p>
      </div>
    </div>
  );
}