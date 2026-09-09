# Plan: Add 6 New Games

## Engine API Reference

- **Screen**: 160×144 px, 4-color DMG green palette (indices 0-3)
- **Base class**: `Game` from `@/engine/api` — implements `init()`, `update(input, dt)`, `draw(renderer)`
- **Drawing**: `renderer.drawRect()`, `renderer.drawText()`, `renderer.clear()`
- **Sprites**: `Sprite` class with x/y, vx/vy, frames, collision, colorIndex (0-3)
- **TileMap**: Grid-based with solid tiles, collision detection, camera scrolling
- **Audio**: `this.audio.beep()`, `.boop()`, `.jump()`, `.coin()`, `.explosion()`, `.playTone(freq, dur, type, vol)`
- **Input**: `GamePadState` — up/down/left/right/a/b/start/select (booleans)
- **SaveState**: `SaveState.save(key, value)` / `SaveState.load(key)` for persistence

## DMG Palette

| Index | Color | Hex | Use |
|-------|-------|-----|-----|
| 0 | Lightest green | #9bbc0f | Background |
| 1 | Medium green | #8bac0f | Light elements |
| 2 | Dark green | #306230 | Medium elements |
| 3 | Darkest green | #0f380f | Player, text, dark elements |

---

## Game 1: Tetris

**File**: `src/engine/games/tetris/TetrisGame.ts`

### Grid
- Play field: 10 wide × 20 tall, 8px tiles = 80×160 pixels (uses full height, centered horizontally)
- Next piece preview: top-right corner

### Tetrominoes (4×4 grids)
```
I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]
O: [[1,1],[1,1]]
T: [[0,1,0],[1,1,1],[0,0,0]]
S: [[0,1,1],[1,1,0],[0,0,0]]
Z: [[1,1,0],[0,1,1],[0,0,0]]
J: [[1,0,0],[1,1,1],[0,0,0]]
L: [[0,0,1],[1,1,1],[0,0,0]]
```

### Controls
| Input | Action |
|-------|--------|
| Left | Move piece left |
| Right | Move piece right |
| Up | Rotate clockwise |
| Down | Soft drop (+1 pt per row) |
| A | Hard drop (instant, +2 pt per row) |

### Mechanics
- Piece spawns at top center (column 3-6)
- Auto-falls every N frames (speed increases with level)
- Wall kick: try 1-cell offset if rotation blocked
- Line clear: scan all rows, remove full rows, shift down
- Scoring: 40/100/300/1200 × level for 1/2/3/4 lines
- Level up: every 10 lines cleared
- Speed: fall interval = max(100, 800 - (level × 70)) ms
- Game over: new piece can't spawn (collision at spawn)

### Rendering
- Background: color 0
- Grid lines: color 1 (subtle)
- Placed blocks: color 2
- Active piece: color 3
- Ghost piece (shadow): color 1 (shows where piece will land)
- HUD: score, level, lines at top

### Sound
- `beep()` on rotate
- `coin()` on line clear
- `boop()` on hard drop
- `explosion()` on game over

---

## Game 2: Breakout

**File**: `src/engine/games/breakout/BreakoutGame.ts`

### Layout
- Bricks: 8 rows × 20 columns, each 8×4 px = 160×32 px at top
- Paddle: 24×4 px at bottom (y=132)
- Ball: 4×4 px
- Lives display: top-left

### Controls
| Input | Action |
|-------|--------|
| Left | Move paddle left |
| Right | Move paddle right |
| A | Launch ball (when stuck to paddle) |

### Mechanics
- Ball sticks to paddle at start, launches on A press
- Ball velocity: base 60 px/s, increases 5% per brick hit (max 120)
- Bounce angle varies based on where ball hits paddle (center = straight, edges = steep)
- Ball bounces off top/side walls, paddle, and bricks
- Brick colors by row (top=dark, bottom=light) for scoring
- Scoring: top row 8pts, bottom row 1pt per brick
- 3 lives, lose ball = lose life, ball resets to paddle
- Levels: different brick patterns, speed increase

### Rendering
- Background: color 0
- Bricks: colors 1-3 by row
- Paddle: color 3
- Ball: color 3
- HUD: lives (hearts), score, level

### Sound
- `beep()` on paddle/wall bounce
- `boop()` on brick hit (pitch increases per row)
- `explosion()` on life lost
- `coin()` on level complete

---

## Game 3: Flappy Bird

**File**: `src/engine/games/flappy/FlappyGame.ts`

### Layout
- Bird: 8×8 px at x=40
- Pipes: 16px wide, gap of 40px height at random y
- Ground: bottom 16px (visual only, collision zone)
- Background scrolls slowly

### Controls
| Input | Action |
|-------|--------|
| A | Flap (jump up) |

### Mechanics
- Gravity: +300 px/s² downward
- Flap: sets vy = -120 (upward)
- Terminal velocity: 200 px/s max fall speed
- Pipe spacing: every 200px horizontally
- Pipe gap: random y between 20 and 80 (top of gap)
- Pipes scroll left at 60 px/s
- Score: +1 per pipe passed
- Game over: bird hits pipe, ground, or ceiling
- Bird rotation: tilts up when flapping, down when falling

### Rendering
- Background: color 0 with parallax clouds (color 1)
- Bird: color 3 (with simple frame animation)
- Pipes: color 2 (top and bottom sections)
- Ground: color 2 (solid strip at bottom)
- Score: large text at top center
- Game over: "GAME OVER" + "PRESS A" overlay

### Sound
- `jump()` on flap
- `coin()` on pipe pass
- `explosion()` on death

---

## Game 4: Space Invaders

**File**: `src/engine/games/invaders/InvaderGame.ts`

### Layout
- Player ship: 8×8 px at bottom center
- Aliens: 5 rows × 8 columns, 8×8 px each, spaced 10px apart
- Bullets: 2×6 px (player and alien)
- Shields: 4 barriers at bottom, 16×8 px each

### Controls
| Input | Action |
|-------|--------|
| Left | Move ship left |
| Right | Move ship right |
| A | Shoot bullet (1 at a time) |

### Mechanics
- Aliens move side-to-side, shift down 8px when hitting edge
- Alien speed: starts at 1 px/frame, increases as aliens die
- Player shoots one bullet at a time (80 px/s upward)
- Aliens randomly shoot back (every 1-3 seconds, max 3 bullets)
- Bullets destroy shields on contact
- Shields regenerate each life
- 3 lives, game over when all lives lost or aliens reach player row
- Scoring: top row 5pts, bottom row 1pt per alien

### Rendering
- Background: color 0
- Player: color 3
- Aliens: color 2 (alternating animation frames)
- Bullets: color 3 (player), color 2 (alien)
- Shields: color 1
- HUD: score, lives, high score

### Sound
- `beep()` on shoot
- `explosion()` on alien kill
- `boop()` on player hit
- `playTone()` march节奏 for alien movement

---

## Game 5: Bomberman

**File**: `src/engine/games/bomberman/BombermanGame.ts`

### Grid
- 13 wide × 11 tall, 8px tiles = 104×88 pixels (centered on screen)
- Indestructible walls: checkerboard pattern (every other cell)
- Destroyable blocks: fill remaining cells (except spawn)
- Exit door: hidden under a destroyable block

### Controls
| Input | Action |
|-------|--------|
| D-pad | Move in 4 directions |
| A | Place bomb at current tile |

### Mechanics
- Player starts at top-left (0,0)
- Bombs: 2-second timer, explode in cross pattern (range 3 tiles)
- Explosion destroys blocks, kills enemies, damages player
- Exit door appears when all destroyable blocks in path are cleared
- Enemies: 3-5 random movers, walk in straight lines, bounce off walls
- Power-ups (hidden in blocks):
  - Bomb+ (max bombs increase)
  - Fire+ (explosion range increase)
  - Speed+ (movement speed increase)
- Win: reach exit door
- Lose: touch enemy or explosion

### Rendering
- Background: color 0
- Indestructible walls: color 3
- Destroyable blocks: color 2
- Player: color 3 (with animation)
- Bombs: color 2 (blinking before explosion)
- Explosion: color 3 (brief flash)
- Enemies: color 3 (different shade or pattern)
- Exit door: color 1
- Power-ups: color 1
- HUD: score, lives, level

### Sound
- `explosion()` on bomb
- `coin()` on power-up collect
- `beep()` on bomb place
- `boop()` on enemy death
- `jump()` on level complete

---

## Game 6: Snake II

**File**: `src/engine/games/snake2/Snake2Game.ts`

### Grid
- 20 wide × 18 tall, 8px tiles = 160×144 pixels (full screen)

### Controls
| Input | Action |
|-------|--------|
| D-pad | Change direction |

### Enhancements over original Snake
1. **Teleporter portals**: 2 pairs of portals, snake wraps through them
2. **Obstacle walls**: appear after score 5, 15, 25
3. **Special food**: golden food appears briefly, worth 5 pts
4. **Speed tiers**: speed increases at score 5, 10, 20
5. **High score**: persisted via SaveState

### Mechanics
- Snake starts at center, length 3, moving right
- Normal food: 1 pt, grows by 1
- Special food: 5 pts, appears for 3 seconds, 10% chance after normal food
- Teleporters: entering one exits the other (no wall collision at portal)
- Obstacles: indestructible walls placed at fixed patterns
- Game over: hit wall, obstacle, self, or enemy (if added)
- Speed: move interval = max(60, 150 - (score × 3)) ms

### Rendering
- Background: color 0
- Snake head: color 3
- Snake body: color 2 (gradient tail)
- Food: color 3 (blinking)
- Special food: color 1 (golden, pulsing)
- Teleporters: color 1 (animated)
- Obstacles: color 3
- HUD: score, high score, speed tier

### Sound
- `coin()` on normal food
- `jump()` on special food
- `beep()` on teleport
- `explosion()` on death

---

## File Structure

```
src/engine/games/
├── tetris/
│   └── TetrisGame.ts
├── breakout/
│   └── BreakoutGame.ts
├── flappy/
│   └── FlappyGame.ts
├── invaders/
│   └── InvaderGame.ts
├── bomberman/
│   └── BombermanGame.ts
├── snake2/
│   └── Snake2Game.ts
├── registry.ts          (add 6 entries)
└── index.ts             (export 6 games)
```

## UI Changes

### game-selector.tsx
- Add icons for new games:
  - tetris: 🧱
  - breakout: 🧱
  - flappy: 🐦
  - invaders: 👾
  - bomberman: 💣
  - snake2: 🐍
- Add `flex-wrap` to container for 9 cards
- Consider 2 rows or scrollable container on small screens

### page.tsx
- No changes needed (dynamic from registry)

## Testing

Each game gets 3-5 E2E tests in `tests/e2e/gameplay.spec.ts`:
1. Load test — renders, FPS > 0
2. Controls test — input produces visible change
3. Core mechanic test — line clear, brick break, pipe pass, etc.
4. Game over test — death condition works
5. Reset test — reset button restarts

### Total: ~30 new tests (6 games × 5 tests)

## Execution Order

1. Create all 6 game files
2. Update registry.ts and index.ts
3. Update game-selector.tsx icons
4. Run existing tests (verify no regressions)
5. Write new gameplay tests
6. Manual playtest each game
7. Commit and push
