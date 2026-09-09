# Plan: Built-in Games

## Goal
Create three polished built-in games demonstrating the engine: Pong, Snake, Platformer.

## Games

### 1. Pong (`engine/games/pong/PongGame.ts`)
**Concept**: Two paddles, one ball, score to 11.

**Entities**:
- `Ball` (Sprite): position, velocity, collision with paddles/walls
- `Paddle` (Sprite): player (left) and AI (right), vertical movement
- `Score` (Entity): displays score, handles win condition

**Mechanics**:
- Ball speeds up each paddle hit
- AI paddle tracks ball Y with slight delay
- Wall collision (top/bottom bounce)
- Paddle collision (angle based on hit position)
- Score flash, reset ball to center

**Controls**:
- Player 1: Up/Down arrows
- Player 2 (vs AI): auto, or W/S for 2-player

### 2. Snake (`engine/games/snake/SnakeGame.ts`)
**Concept**: Classic snake - eat food, grow, avoid walls/self.

**Entities**:
- `Snake` (Entity with segments): head + body segments as Sprites
- `Food` (Sprite): random position, blink animation
- `Score` (Entity): current length - 3

**Mechanics**:
- Grid-based movement (8×8 tiles = 20×18 grid)
- Direction queue (prevents 180° turns)
- Self-collision detection
- Wall collision (game over)
- Speed increases every 5 food
- High score saved to localStorage

**Controls**:
- D-pad: change direction (queued)

### 3. Platformer (`engine/games/platformer/PlatformerGame.ts`)
**Concept**: Side-scrolling platformer - jump, collect coins, reach flag.

**Entities**:
- `Player` (Entity): Sprite, physics (gravity, velocity), states (idle, run, jump, fall)
- `Platform` (TileMap): solid tiles, platforms
- `Coin` (Sprite): rotating animation, collectible
- `Flag` (Sprite): level end trigger
- `Camera` (Entity): follows player X

**Mechanics**:
- Variable jump height (hold A = higher)
- Coyote time (jump shortly after leaving ground)
- Jump buffering (press jump before landing)
- Coin collection (score + sound)
- Level complete (flag touch)
- Multiple levels (stored in TileMap data)

**Controls**:
- Left/Right: move
- A: jump (variable height)
- Start: pause

## Game Registry (`engine/games/registry.ts`)
```typescript
export interface GameInfo {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // base64 or data URL
  create: () => Game;
}

export const gameRegistry: GameInfo[] = [
  { id: 'pong', name: 'PONG', description: 'Classic paddle game', ... },
  { id: 'snake', name: 'SNAKE', description: 'Eat and grow', ... },
  { id: 'platformer', name: 'PLATFORMER', description: 'Jump and run', ... },
];

export function getGame(id: string): GameInfo | undefined;
export function createGame(id: string): Game | null;
```

## Tests
- Each game: init/update/draw cycle
- Pong: ball physics, scoring, AI
- Snake: movement, growth, collision, high score
- Platformer: physics, jump, coins, level complete

## Verification
- `pnpm test` passes all game tests
- Games selectable from toolbar
- All mechanics work correctly
- Save/load high scores work