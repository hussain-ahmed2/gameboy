# Plan: Integration & Polish

## Goal
Wire everything together: Engine hook, React context store, main page, E2E tests, and final polish.

## Files

### 1. hooks/useEngine.ts
```typescript
export function useEngine() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [framebuffer, setFramebuffer] = useState<Uint8Array | null>(null);
  const [fps, setFps] = useState(0);
  
  const engineRef = useRef<GameLoop>();
  const rendererRef = useRef<Renderer>();
  const inputRef = useRef<Input>();
  const audioRef = useRef<Audio>();
  
  // Initialize engine on mount
  // loadGame(id): creates Game instance, calls init()
  // start/pause/resume/reset
  // Returns: { currentGame, isRunning, isPaused, framebuffer, fps, loadGame, start, pause, resume, reset, handleButtonChange }
}
```

### 2. features/store/engine-context.tsx
```typescript
// React Context for engine state + actions
// Similar to emulator-context but for game engine
```

### 3. app/page.tsx
- Centered GameBoy shell
- GameBoyShell with Screen and Controls
- Toolbar with GameSelector, Pause, Reset, Volume
- Status bar with GameInfo, FPS

### 4. E2E Tests (`tests/e2e/`)
- `app.spec.ts`: Page loads, shell renders
- `controls.spec.ts`: Keyboard input works
- `game-selector.spec.ts`: Switch games
- `pong.spec.ts`: Pong plays correctly
- `snake.spec.ts`: Snake plays correctly
- `platformer.spec.ts`: Platformer plays correctly
- `mobile.spec.ts`: Touch controls on mobile viewport

### 5. Polish
- Scanline CSS overlay
- Screen curvature (border-radius + box-shadow)
- Button press feedback (active:scale-95)
- Boot animation (GameBoy-style power on)
- Responsive scaling (maintains 160:144 aspect)
- Fullscreen support
- Save state persistence (high scores, game progress)

## Verification
- `pnpm test` passes all unit tests (64+)
- `pnpm test:e2e` passes all E2E tests
- `pnpm build` production build succeeds
- All 3 games playable start to finish
- Mobile touch works
- Save states persist across reloads