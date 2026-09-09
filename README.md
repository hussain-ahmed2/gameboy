# GameBoy Game Engine

A **GameBoy-inspired game engine** built with Next.js 16, React 19, Tailwind CSS v4, and TypeScript. Write games in TypeScript - no ROMs, no assembly, no external tools. The engine provides a GameBoy-compatible API (160×144, 4-color palette, sprites, tilemaps, input, audio) and runs your TypeScript game code at 60 FPS.

## Features

- **TypeScript Game API** — Sprites, TileMaps, Entities, Input, Audio
- **Authentic DMG Look** — 160×144 resolution, 4-shade green palette, scanlines
- **Built-in Games** — Pong, Snake, Platformer (all written in TypeScript)
- **Game Selector** — Switch between games instantly
- **Save States** — Persist game progress to localStorage
- **Keyboard + Touch** — Play on desktop or mobile
- **60 FPS Fixed Timestep** — Deterministic game loop

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (CSS-first theme) |
| Language | TypeScript 5 (strict) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
git clone git@github.com-personal:hussain-ahmed2/gameboy.git
cd gameboy
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── page.tsx            # Home page (GameBoy shell + game selector)
│   └── globals.css         # DMG theme palette
│
├── engine/                 # Game engine core
│   ├── core/
│   │   ├── GameLoop.ts     # 60 FPS fixed timestep loop
│   │   ├── Renderer.ts     # Canvas 2D with DMG palette
│   │   ├── Input.ts        # Keyboard/Touch → GamePad state
│   │   ├── Audio.ts        # Web Audio API wrapper
│   │   └── SaveState.ts    # localStorage persistence
│   │
│   ├── api/
│   │   ├── Game.ts         # Base Game class (init/update/draw)
│   │   ├── Sprite.ts       # Sprite with position, animation
│   │   ├── TileMap.ts      # Background tile maps
│   │   ├── Entity.ts       # Game entities with components
│   │   ├── GamePad.ts      # Input state (D-pad, A, B, Start, Select)
│   │   └── Sound.ts        # Sound effects / music
│   │
│   └── games/              # Built-in games
│       ├── registry.ts     # Game registry & dynamic loading
│       ├── pong/
│       │   └── PongGame.ts
│       ├── snake/
│       │   └── SnakeGame.ts
│       └── platformer/
│           └── PlatformerGame.ts
│
├── features/
│   ├── ui/                 # React components
│   │   ├── shell/          # GameBoy DMG shell
│   │   ├── screen/         # Canvas display + effects
│   │   ├── controls/       # D-pad, A/B, Start/Select
│   │   ├── toolbar/        # Game selector, pause, reset, volume
│   │   └── status/         # Power LED, FPS, game info
│   │
│   └── store/              # React Context for UI state
│
├── hooks/
│   ├── useEngine.ts        # Engine lifecycle hook
│   ├── useKeyboard.ts      # Keyboard input
│   ├── useTouch.ts         # Touch input
│   └── useRaf.ts           # requestAnimationFrame loop
│
└── lib/
    ├── types.ts            # Shared TypeScript interfaces
    ├── constants.ts        # Screen size, palette, key mapping
    └── cn.ts               # Class name utility
```

## Game API

### Base Game Class
```typescript
import { Game, Sprite, TileMap, Input, Audio } from '@/engine';

export class MyGame extends Game {
  init() {
    // Called once on game start
    this.player = new Sprite({ x: 80, y: 72, frames: [...] });
    this.map = new TileMap({ width: 20, height: 18, tiles: [...] });
  }

  update(input: Input, deltaTime: number) {
    // Called 60 times/second
    if (input.right.pressed) this.player.x += 2;
  }

  draw(renderer: Renderer) {
    // Called after update
    renderer.drawSprite(this.player);
    renderer.drawTileMap(this.map);
  }
}
```

### Key Classes

| Class | Purpose |
|-------|---------|
| `Game` | Extend to create games (`init`, `update`, `draw`) |
| `Sprite` | Animated sprite with position, velocity, frames |
| `TileMap` | Background layers with collision data |
| `Entity` | Composable game objects (position, components) |
| `Input` | GamePad state (D-pad, A, B, Start, Select) |
| `Audio` | Play sound effects, music via Web Audio |
| `Renderer` | Draw sprites, tilemaps, text to canvas |

## Built-in Games

| Game | Description |
|------|-------------|
| **Pong** | Classic 2-player paddle game |
| **Snake** | Eat food, grow, don't hit walls |
| **Platformer** | Jump, collect coins, reach goal |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 4000 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server on port 4000 |
| `pnpm test` | Run unit tests (Vitest watch) |
| `pnpm test:run` | Run unit tests (single run) |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm test:e2e:ui` | Playwright interactive UI |
| `pnpm test:all` | Run all tests |
| `pnpm lint` | Run ESLint |

## Color Palette (DMG Authentic)

| Name | Hex | Usage |
|------|-----|-------|
| Lightest | `#9bbc0f` | Color 0 (background) |
| Light | `#8bac0f` | Color 1 |
| Dark | `#306230` | Color 2 |
| Darkest | `#0f380f` | Color 3 (foreground) |

## Controls

### Keyboard
| Key | Action |
|-----|--------|
| Arrow Keys | D-pad |
| Z | A Button |
| X | B Button |
| Enter | Start |
| Right Shift | Select |

### Touch (Mobile)
On-screen D-pad and A/B/Start/Select buttons.

## License

MIT