# Plan 08: Modern GameBoy Evolution (Analogue Pocket Experience)

## What we are building

Transform the GameBoy engine into an **Analogue Pocket-inspired modern retro console**. We will build this iteratively, preserving our pure TypeScript 60 FPS canvas engine while adding modern console ergonomics: universal in-game pause via `START`, instant sleep/wake (suspend & resume), a dedicated physical Home/Analogue button, multi-palette display modes, and save-state "Memories".

---

## The 5-Phase Roadmap

1. **Phase 1: Universal Pause, Sleep/Wake & Dedicated Home Button** (Immediate Focus)
2. **Phase 2: Modern Display Modes** (DMG Green, Pocket B&W, GameBoy Light Teal, LCD Subpixel Grid)
3. **Phase 3: Analogue Pocket Modern Chassis** (Sleek Matte Black / Pure White shell option)
4. **Phase 4: Analogue "Memories"** (Visual Save State slots with thumbnail capture)
5. **Phase 5: Library & Playtime Dashboard** (Session timers, high score showcases, cartridge aesthetic)

---

## Language & Core Concepts

- **"Universal Pause"** — Pressing `START` (or `Enter` on keyboard) reliably freezes gameplay and opens the in-screen pause overlay across all 9 games.
- **"Instant Sleep / Wake"** — Suspending the engine immediately (via Page Visibility API or hardware sleep button) without losing frame position or game state.
- **"Home Button"** — Dedicated circular Analogue/Home button between Select and Start that provides one-touch access to system overlay controls.
- **"Memories"** — Point-in-time state snapshots saved to `localStorage` with date, score, and framebuffer data.

---

## Decisions Made

- **Keep native TypeScript architecture**: No heavy emulator dependencies; all features integrate with our existing `GameLoop`, `Renderer`, and `EngineStateMachine`.
- **Zero-lag pause transition**: State changes cleanly capture the framebuffer before transitioning into `EngineState.PAUSED`.
- **Touch-first mobile ergonomics**: On mobile, buttons will have distinct tactile feedback (`active:scale-95`, `min-44px` hitboxes, `touch-manipulation`) to completely prevent scrolling or missed taps.
- **Automatic mobile background sleep**: If a mobile player locks their phone, switches apps, or changes tabs, the `visibilitychange` listener will automatically trigger `pause()` so they never die when interrupted.

---

## Phase 1 Detailed Implementation

### Step 1: Core Engine State Machine Update
**File**: `src/engine/core/EngineStateMachine.ts`
- Add pause trigger when `input.isJustPressed('start')` or home button is received during `EngineState.PLAYING`.
- Refine the in-screen `PAUSED` overlay:
  - Options: `RESUME`, `RESTART`, `SAVE STATE`, `MENU`.
  - Allow `START`, `A`, or `B` to resume effortlessly.
  - Play an authentic chiptune pause chime when entering/exiting pause.

### Step 2: Game Loop & Lifecycle Integration
**File**: `src/hooks/use-engine.ts`
- In `update(deltaTime)`:
  - Intercept `input.isJustPressed('start')` in `EngineState.PLAYING` to call `pause()`.
- Add `sleep()` and `wake()` handlers:
  - Attach `visibilitychange` listener on `document`.
  - Automatically pause when `document.hidden === true`.

### Step 3: Dedicated Home / Analogue Button Component
**File**: `src/features/ui/controls/home-button.tsx` (NEW)
- Render the signature circular Analogue-style home button.
- Clean retro-modern aesthetic with tactile press states.
- Triggers quick pause/resume toggle on click/touch.

### Step 4: Ergonomic Controls Layout
**File**: `src/features/ui/controls/meta-buttons.tsx`
- Update layout to seat the Home button comfortably between Select and Start:
  ```
  [ SELECT ]    ( ○ HOME )    [ START ]
  ```
- Ensure full touch-event hygiene to prevent double-firing and scroll locks on mobile Safari/Chrome.

### Step 5: Clean Up Mobile Shell & Top Edge Button
**File**: `src/app/page.tsx`
- Remove the tiny, low-contrast `absolute top-2 right-2` button.
- Add an elegant chassis **Sleep / Wake** power button on the top edge of the shell (just like the physical Analogue Pocket's top power button).
- Support keyboard shortcuts:
  - <kbd>Enter</kbd> / <kbd>z</kbd>: Start / A
  - <kbd>Escape</kbd> / <kbd>Home</kbd>: Pause / Home Menu
  - <kbd>P</kbd>: Instant Sleep Toggle

---

## File Changes Summary (Phase 1)

| File | Action | Description |
|------|--------|-------------|
| `src/engine/core/EngineStateMachine.ts` | EDIT | Add `START` button pause detection in `PLAYING` state & modern pause overlay |
| `src/hooks/use-engine.ts` | EDIT | Hook `START` to `pause()`, add `visibilitychange` auto-sleep |
| `src/features/ui/controls/home-button.tsx` | NEW | Dedicated circular Home / Analogue button component |
| `src/features/ui/controls/meta-buttons.tsx` | EDIT | Layout `Select`, `Home`, and `Start` with mobile-optimized hitboxes |
| `src/app/page.tsx` | EDIT | Replace clumsy top-right button with sleek top-edge Sleep/Power button |
| `tests/e2e/controls.spec.ts` | EDIT | Add E2E tests for `START` pause, `Home` button toggle, and mobile touch |

---

## Verification Plan

1. **Type Safety & Build**:
   ```bash
   pnpm exec tsc --noEmit
   ```
2. **E2E Playwright Suite**:
   ```bash
   pnpm test:e2e
   ```
3. **Mobile Manual Testing (375×812 viewport)**:
   - Launch Pong / Snake / Tetris on mobile viewport.
   - Tap on-screen **`START`** button: verify immediate pause overlay.
   - Tap on-screen **`HOME`** button: verify immediate pause/resume toggle.
   - Tap on-screen **`RESUME`** or press **`START`**: verify instant seamless resume.
   - Simulate switching tabs / app blur: verify automatic suspend.
