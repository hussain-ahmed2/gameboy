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
    <div className="flex items-center justify-between px-1.5 select-none">
      {/* Debossed Personal Brand Monogram: HA • HUSSAIN AHMED */}
      <div
        title="Designed & Crafted by Hussain Ahmed"
        className="flex items-center gap-1.5 opacity-55 hover:opacity-90 transition-opacity"
        style={{
          filter:
            "drop-shadow(0 1px 0 rgba(255, 255, 255, 0.12)) drop-shadow(0 -1px 0.5px rgba(0, 0, 0, 0.75))",
        }}
      >
        <div className="flex items-center gap-0.5">
          <span className="w-4 h-4 rounded-[3px] bg-black/40 border border-white/15 flex items-center justify-center font-sans font-black text-[7px] text-white/85">
            H
          </span>
          <span className="w-4 h-4 rounded-[3px] bg-black/40 border border-white/15 flex items-center justify-center font-sans font-black text-[7px] text-white/85">
            A
          </span>
        </div>
        <span className="font-sans font-bold text-[7px] tracking-[0.16em] text-white/55 uppercase">
          BY HUSSAIN
        </span>
      </div>

      {/* Hardware Audio Spec & Power Status Indicator (preserves tests) */}
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
        <p className="font-sans font-bold text-[8px] tracking-[0.14em] text-white/50 uppercase">
          DOT MATRIX WITH STEREO SOUND
        </p>
      </div>
    </div>
  );
}