/**
 * @file screen-bezel.tsx
 * @description Dark border frame around the GameBoy LCD screen.
 *   Provides the inset shadow effect and enforces 10:9 aspect ratio.
 */

import { cn } from "@/lib/cn";

interface ScreenBezelProps {
    /** Child elements (the canvas) rendered inside the bezel */
    children: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
}

export function ScreenBezel({ children, className }: ScreenBezelProps) {
    return (
        <div
            data-testid="screen-bezel"
            className={cn(
                "relative bg-[#070709] rounded-[4px] p-3",
                "border border-black/60 ring-1 ring-white/10",
                "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.35)]",
                "aspect-[10/9] overflow-hidden flex flex-col justify-center",
                className,
            )}
        >
            {/* Edge-to-edge specular glass reflection sheen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />

            {/* Active LCD Canvas Matrix Container */}
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden rounded-[3px] shadow-[inset_0_0_10px_rgba(0,0,0,0.95)]">
                {children}
            </div>
        </div>
    );
}
