/**
 * @file page.tsx
 * @description Home page that renders the GameBoy game engine UI.
 *   Composes the shell, screen, controls, and status components.
 */

"use client";

import { useState, useEffect } from "react";
import { EngineProvider, useEngineContext } from "@/features/store";
import { GameBoyShell } from "@/features/ui/shell";
import { Screen } from "@/features/ui/screen";
import { DPad, ActionButtons, MetaButtons, TouchHandler } from "@/features/ui/controls";

function GameBoyContent() {
    const [shellEdition, setShellEdition] = useState<"noir" | "kiwi" | "white">("noir");
    const {
        isRunning,
        isPaused,
        framebuffer,
        displayMode,
        cycleDisplayMode,
        togglePause,
        handleButtonChange,
        isMuted,
        toggleMute,
        playClick,
    } = useEngineContext();

    // Keyboard shortcuts for meta buttons and quick system controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape or 'p' = Pause/Resume toggle (System Sleep)
            if (e.key === "Escape" || e.key === "p" || e.key === "P") {
                togglePause();
            }
            // 'm' or 'M' = Cycle display mode (DMG, Pocket, Light)
            if (e.key === "m" || e.key === "M") {
                cycleDisplayMode();
            }
            // 's' or 'S' = Toggle Sound/Mute
            if (e.key === "s" || e.key === "S") {
                const muted = toggleMute();
                if (!muted) playClick();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [togglePause, cycleDisplayMode, toggleMute, playClick]);

    return (
        <main
            data-shell-edition={shellEdition}
            className="min-h-screen relative flex flex-col items-center justify-center p-4 selection:bg-white/10 transition-colors duration-500 overflow-hidden"
            style={{
                background: "var(--bg-gradient, var(--bg))",
            }}
        >
            {/* Soft Ambient Studio Lighting Halo behind Console */}
            <div
                className="pointer-events-none absolute w-[460px] h-[640px] max-w-full rounded-full blur-3xl opacity-75 transition-all duration-700 -z-10"
                style={{
                    background: "var(--ambient-halo)",
                }}
            />

            {/* Centered Settings: Shell Colors, Screen Display Palette & Sound Toggle */}
            <div className="flex items-center justify-center gap-2 mb-3 select-none">
                {/* Shell Edition Swatches */}
                <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10 shadow-sm gap-1.5">
                    <button
                        onClick={() => {
                            playClick();
                            setShellEdition("noir");
                        }}
                        title="Noir Black Shell"
                        aria-label="Noir Black Shell"
                        className={`w-5 h-5 rounded-full bg-[#161619] border transition-all cursor-pointer ${
                            shellEdition === "noir"
                                ? "border-emerald-400 scale-110 shadow-sm ring-1 ring-emerald-400/50"
                                : "border-white/20 opacity-60 hover:opacity-100"
                        }`}
                    />
                    <button
                        onClick={() => {
                            playClick();
                            setShellEdition("kiwi");
                        }}
                        title="Kiwi Green Shell"
                        aria-label="Kiwi Green Shell"
                        className={`w-5 h-5 rounded-full bg-[#7ee647] border transition-all cursor-pointer ${
                            shellEdition === "kiwi"
                                ? "border-emerald-400 scale-110 shadow-sm ring-1 ring-emerald-400/50"
                                : "border-white/20 opacity-60 hover:opacity-100"
                        }`}
                    />
                    <button
                        onClick={() => {
                            playClick();
                            setShellEdition("white");
                        }}
                        title="Pure White Shell"
                        aria-label="Pure White Shell"
                        className={`w-5 h-5 rounded-full bg-[#f0f2f5] border transition-all cursor-pointer ${
                            shellEdition === "white"
                                ? "border-emerald-400 scale-110 shadow-sm ring-1 ring-emerald-400/50"
                                : "border-white/20 opacity-60 hover:opacity-100"
                        }`}
                    />
                </div>

                {/* Screen Color Palette Mode */}
                <button
                    onClick={() => {
                        playClick();
                        cycleDisplayMode();
                    }}
                    title="Click or press 'M' to cycle screen color mode"
                    className="font-sans font-bold text-[9px] tracking-wider px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/20 text-white/90 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                    <span
                        className="w-2 h-2 rounded-full inline-block shadow-sm"
                        style={{
                            backgroundColor:
                                displayMode === "dmg" ? "#9bbc0f" : displayMode === "pocket" ? "#e4ebe3" : "#5ae2b5",
                        }}
                    />
                    <span>
                        {displayMode === "dmg" ? "DMG GREEN" : displayMode === "pocket" ? "POCKET B&W" : "LIGHT TEAL"}
                    </span>
                </button>

                {/* Sound / Mute Toggle */}
                <button
                    onClick={() => {
                        const muted = toggleMute();
                        if (!muted) playClick();
                    }}
                    title={isMuted ? "Unmute Audio (Sound is Off)" : "Mute Audio (Sound is On)"}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    className="font-sans font-bold text-[9px] tracking-wider px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/20 text-white/90 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                    {isMuted ? (
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-amber-400"
                        >
                            <line x1="1" y1="1" x2="23" y2="23" />
                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        </svg>
                    ) : (
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-emerald-400"
                        >
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    )}
                    <span>{isMuted ? "MUTED" : "SOUND"}</span>
                </button>
            </div>

            <GameBoyShell edition={shellEdition} isRunning={isRunning} isPaused={isPaused}>
                {/* Screen - renders 160x144 framebuffer with active display filter */}
                <Screen framebuffer={framebuffer} gameLoaded={true} displayMode={displayMode} />

                {/* Controls Section with Generous Spacing and Visible Typography */}
                <TouchHandler className="mt-6">
                    <div className="flex items-center justify-between px-3">
                        <DPad onButtonChange={handleButtonChange} />
                        <ActionButtons onButtonChange={handleButtonChange} />
                    </div>
                    <div className="mt-5 flex justify-center">
                        <MetaButtons
                            onButtonChange={handleButtonChange}
                            onHomePress={() => {
                                playClick();
                                togglePause();
                            }}
                            isPaused={isPaused}
                        />
                    </div>
                </TouchHandler>
            </GameBoyShell>

            {/* Footer: Controls Guide & Made By Credit */}
            <footer className="mt-4 flex flex-col items-center justify-center gap-2.5 text-white/50 select-none">
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">
                        START / ESC: PAUSE
                    </span>
                    <span>•</span>
                    <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">P: SLEEP</span>
                    <span>•</span>
                    <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">M: PALETTE</span>
                    <span>•</span>
                    <span className="font-sans font-bold text-[10px] tracking-wider text-white/70">S: SOUND</span>
                </div>

                {/* Made By Credit & GitHub Profile Link */}
                <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[9px] tracking-widest uppercase text-white/40">
                        MADE BY
                    </span>
                    <a
                        href="https://github.com/hussain-ahmed2"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Hussain Ahmed on GitHub"
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/60 hover:text-white transition-all cursor-pointer group"
                    >
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span className="font-sans text-[10px] tracking-wide font-semibold text-white/80 group-hover:text-white">
                            Hussain Ahmed
                        </span>
                    </a>
                </div>
            </footer>
        </main>
    );
}

export default function Home() {
    return (
        <EngineProvider>
            <GameBoyContent />
        </EngineProvider>
    );
}
