/**
 * @file gameboy-shell.tsx
 * @description Main GameBoy DMG shell wrapper component.
 *   Renders the colorful body with rounded corners, screen bezel,
 *   label, speaker, and control area.
 */

import { ShellLabel } from "./shell-label";
import { cn } from "@/lib/cn";

interface GameBoyShellProps {
    /** Shell color edition (noir, kiwi, white) */
    edition?: "noir" | "kiwi" | "white";
    /** Whether the game is running (controls LED) */
    isRunning?: boolean;
    /** Whether the console is paused/sleeping */
    isPaused?: boolean;
    /** Child elements rendered inside the shell */
    children?: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
}

export function GameBoyShell({
    edition = "noir",
    isRunning = false,
    isPaused = false,
    children,
    className,
}: GameBoyShellProps) {
    return (
        <div
            data-testid="gameboy-shell"
            data-shell-edition={edition}
            className={cn(
                "relative flex flex-col",
                "bg-shell rounded-[8px] p-5 pb-6",
                "border border-shell-border",
                "w-[400px] max-w-full transition-all duration-300",
                className,
            )}
            style={{
                boxShadow: "var(--shell-shadow)",
            }}
        >
            {/* Screen area (Edge-to-edge dark glass panel) */}
            <div className="relative">{children}</div>

            {/* Bottom Hardware Spec Bar: Debossed HA monogram + DOT MATRIX label & status LED */}
            <div className="mt-5 pt-1">
                <ShellLabel isRunning={isRunning} isPaused={isPaused} />
            </div>
        </div>
    );
}
