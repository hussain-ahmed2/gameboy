# Plan: UI Components

## Goal
Build the GameBoy shell UI with game selector, screen, controls, toolbar, and status indicators.

## Components (small, single-responsibility)

### Shell (`features/ui/shell/`)
- `gameboy-shell.tsx` — Main DMG body wrapper (grey rounded rectangle)
- `shell-label.tsx` — "DOT MATRIX WITH STEREO SOUND" text
- `shell-speaker.tsx` — Speaker grill dot pattern

### Screen (`features/ui/screen/`)
- `screen.tsx` — Canvas container (160×144 scaled via CSS)
- `canvas-renderer.ts` — Canvas 2D rendering logic
- `scanline-overlay.tsx` — CSS scanline effect
- `screen-bezel.tsx` — Dark border frame around screen
- `boot-screen.tsx` — GameBoy boot animation placeholder

### Controls (`features/ui/controls/`)
- `dpad.tsx` — Cross-shaped D-pad container
- `dpad-button.tsx` — Single direction button
- `action-buttons.tsx` — A + B container (angled)
- `action-button.tsx` — Single A or B button
- `meta-buttons.tsx` — Start + Select container
- `meta-button.tsx` — Single Start or Select button
- `touch-handler.tsx` — Touch event wrapper (prevent scroll)

### Toolbar (`features/ui/toolbar/`)
- `toolbar.tsx` — Horizontal button bar
- `game-selector.tsx` — Dropdown to switch games
- `pause-button.tsx` — Pause/resume toggle
- `reset-button.tsx` — Reset current game
- `volume-slider.tsx` — Audio volume control
- `fullscreen-button.tsx` — Fullscreen API toggle

### Status (`features/ui/status/`)
- `power-led.tsx` — Red LED with glow
- `fps-counter.tsx` — FPS display (dev only)
- `game-info.tsx` — Current game name

## Styling
All components use Tailwind classes from the DMG theme:
- `bg-shell`, `bg-shell-dark`, `bg-bezel`
- `bg-lcd-light`, `bg-lcd-med`, `bg-lcd-dark`, `bg-lcd-darkest`
- `bg-btn-ab`, `bg-btn-meta`, `bg-dpad`
- `bg-led` with `shadow-[0_0_8px_#ff0000]` for glow

## Tests
- Each component has a colocated `__tests__/*.test.tsx`
- Tests verify: rendering, callbacks, aria labels, touch events
- Use @testing-library/react with vitest

## Verification
- `pnpm test` passes all component tests
- `pnpm dev` shows the GameBoy shell centered on screen
- Responsive: scales on mobile viewport
- Game selector switches games