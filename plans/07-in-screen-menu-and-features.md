# Plan: In-Screen Menu & Professional Game Features

## What we are building

Transform the GameBoy emulator from a React-toolbar-driven experience into an authentic on-screen menu system rendered on the 160x144 LCD canvas. Add professional game features: consistent game over flow, pause menu, save/load (continue), and high score tracking — all rendered on-screen like a real GameBoy.

## Language we agreed on

- **"In-screen menu"** — Menu content rendered on the 160x144 canvas using the DMG palette, not React components
- **"Engine state machine"** — MENU → PLAYING → PAUSED → GAME_OVER states managed at engine level
- **"Continue"** — Full save-state (resume where you left off), not just high score

## Decisions made

- **Canvas-rendered menu** — Authentic GameBoy feel, menu IS the screen
- **Engine-level state** — Menu/pause/game-over are engine states, not React concerns
- **In-screen pause overlay** — Pressing Start opens pause menu on canvas
- **Bitmap font** — Define pixel font data for proper text rendering on canvas

## Assumptions

- Current games (Pong, Snake, Platformer) will be updated with save/load support
- The toolbar game selector will be removed (replaced by in-screen menu)
- The toolbar controls (pause, reset, volume, fullscreen) remain as secondary access

## Implementation Steps

### Phase 1: Core Infrastructure

1. **Create bitmap font system** (`src/engine/core/BitmapFont.ts`)
   - Define pixel font data for A-Z, 0-9, and basic symbols
   - Each character is an 8x8 pixel grid stored as byte arrays
   - Renderer uses this for all text drawing

2. **Extend Renderer with proper text** (`src/engine/core/Renderer.ts`)
   - Replace placeholder `drawText` with bitmap font rendering
   - Add `drawTextCentered(text, y, colorIndex)` helper
   - Add `drawSelectionHighlight(x, y, w, h)` for menu items

3. **Create engine state machine** (`src/engine/core/EngineStateMachine.ts`)
   - States: BOOT, MENU, PLAYING, PAUSED, GAME_OVER
   - Transitions: select game → PLAYING, press Start → PAUSED, game over → GAME_OVER
   - Each state has its own `update()` and `draw()` methods

### Phase 2: Menu System

4. **Create game list menu** (`src/engine/menu/GameMenu.ts`)
   - Render game list on canvas (3 games with names and high scores)
   - Navigate with DPad up/down, select with A button
   - Show game description and controls hint at bottom

5. **Create pause menu** (`src/engine/menu/PauseMenu.ts`)
   - Overlay semi-transparent background on current frame
   - Options: Resume, Restart, Menu, Sound
   - Navigate with DPad, select with A, exit with B

6. **Create game over screen** (`src/engine/menu/GameOverScreen.ts`)
   - Display "GAME OVER" with score
   - Options: New Game, Continue (if save exists), Menu
   - Navigate with DPad, select with A

### Phase 3: Save/Load System

7. **Extend Game base class** (`src/engine/api/Game.ts`)
   - Add abstract `saveState(): object` method
   - Add abstract `loadState(state: object): void` method
   - Add `getHighScore(): number` method

8. **Update games with save/load**
   - Pong: Save player/ai scores
   - Snake: Save snake position, direction, score, food position
   - Platformer: Save player position, level, coins collected

9. **Extend SaveState** (`src/engine/core/SaveState.ts`)
   - Add `saveGame(gameId, state)` and `loadGame(gameId)` methods
   - Auto-save on pause, manual save from menu

### Phase 4: Integration

10. **Update useEngine hook** (`src/hooks/use-engine.ts`)
    - Integrate state machine
    - Route input based on current state
    - Route draw calls based on current state

11. **Update page.tsx** — Remove toolbar game selector, simplify layout
12. **Update boot screen** — Show animated boot sequence before menu

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/engine/core/BitmapFont.ts` | NEW | Pixel font data and renderer |
| `src/engine/core/EngineStateMachine.ts` | NEW | State machine for engine states |
| `src/engine/menu/GameMenu.ts` | NEW | In-screen game list menu |
| `src/engine/menu/PauseMenu.ts` | NEW | In-screen pause overlay |
| `src/engine/menu/GameOverScreen.ts` | NEW | In-screen game over screen |
| `src/engine/core/Renderer.ts` | EDIT | Add bitmap font text rendering |
| `src/engine/api/Game.ts` | EDIT | Add save/load abstract methods |
| `src/engine/games/pong/PongGame.ts` | EDIT | Add save/load, consistent game over |
| `src/engine/games/snake/SnakeGame.ts` | EDIT | Add save/load, consistent game over |
| `src/engine/games/platformer/PlatformerGame.ts` | EDIT | Add save/load, consistent game over |
| `src/hooks/use-engine.ts` | EDIT | Integrate state machine |
| `src/app/page.tsx` | EDIT | Remove toolbar game selector |
| `src/features/ui/screen/screen.tsx` | EDIT | Remove boot screen logic |
| `src/features/ui/toolbar/game-selector.tsx` | REMOVE | Replaced by in-screen menu |
