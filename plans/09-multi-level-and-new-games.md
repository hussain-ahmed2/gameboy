# Plan: Multi-Level Upgrades & 14 New Games

## Goal
Upgrade 5 existing games with multi-level support and add 14 new games to the library (4 Nokia Classics + 10 new games).

---

## Part A: Multi-Level Upgrades (5 Games)

### 1. Bomberman — Multi-Level
**Current**: `startLevel()` exists but only called once, then "YOU WIN!"

**Changes**:
- Add `currentLevel: number` property (start at 1)
- Add `maxLevel = 10` constant
- Scale difficulty per level:
  - `enemyCount = 3 + currentLevel` (capped at 8)
  - `enemySpeed = 30 + currentLevel * 5`
  - `blockDensity = 0.7 - currentLevel * 0.02` (min 0.5)
- When exit reached: if `currentLevel < maxLevel` → increment level, call `startLevel()`, preserve power-ups
- If `currentLevel >= maxLevel` → game won
- Show `LVL${currentLevel}` in HUD
- Add `currentLevel` to `BombermanSaveState` interface and save/load methods

---

### 2. Invaders — Multi-Level (Wave System)
**Current**: Wave clear detection exists, `resetAliens()` respawns same grid

**Changes**:
- Add `wave: number` property (start at 1)
- Modify `resetAliens()` to accept wave parameter:
  - `baseAlienRows = 5 + Math.floor((wave - 1) / 3)` (capped at 8)
  - `baseMoveInterval = Math.max(0.15, 0.5 - (wave - 1) * 0.03)`
  - `shootInterval = Math.max(0.5, 2.0 - (wave - 1) * 0.15)`
- Show `WAVE${wave}` in HUD
- Add `wave` to `InvaderSaveState` interface and save/load methods
- Bonus: award 100 * wave points on wave clear

---

### 3. Breakout — Multi-Level (Varied Brick Patterns)
**Current**: Infinite levels, but same brick pattern every time

**Changes**:
- Modify `generateBricks()` to use level-based patterns:
  - Level 1-3: Standard 8-row grid
  - Level 4-6: 10-row grid with some gaps
  - Level 7-9: Staggered/offset rows
  - Level 10+: Mixed patterns with unbreakable bricks
- Add color palette rotation: brick colors shift based on `(level % 4)`
- Level number already shown in HUD

---

### 4. Flappy — Multi-Level (Difficulty Tiers)
**Current**: No difficulty progression

**Changes**:
- Add `level: number` property (start at 1)
- Level progression: `level = Math.floor(score / 10) + 1`
- Per-level scaling:
  - `PIPE_GAP = Math.max(30, 40 - (level - 1) * 2)` (minimum gap 30)
  - `PIPE_SPEED = Math.min(2.0, 1.0 + (level - 1) * 0.1)` (max speed 2.0)
- Show `LVL${level}` in HUD
- Add `level` to save state

---

### 5. Snake2 — Multi-Level (Discrete Thresholds)
**Current**: Score-threshold obstacles, no discrete levels

**Changes**:
- Add `currentLevel: number` property (start at 1)
- Define level boundaries at scores: 5, 15, 30, 50, 75, 100
- At each threshold: increment level, spawn new obstacle pattern
- Change background color per level
- Show `LVL${currentLevel}` in HUD

---

## Part B: New Games (14 Games)

### 6. Space Impact (Nokia Classic)
**File**: `engine/games/spaceimpact/SpaceImpactGame.ts`

**Concept**: Side-scrolling space shooter. Move ship, shoot enemies, collect power-ups.

**Grid**: 160x144 (full screen)

**Data Structures**:
```typescript
interface Enemy {
  x: number;
  y: number;
  type: number;
  hp: number;
  speed: number;
  pattern: string;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
  isPlayer: boolean;
}
```

**Mechanics**:
- Player moves in 4 directions (not full vertical freedom like original — constrained to bottom half for GameBoy feel)
- Auto-scroll right (like original Nokia)
- Enemies appear in waves, different types:
  - Type 1: Moves straight
  - Type 2: Follows player
  - Type 3: Shoots back
- Power-ups: rockets (spread), laser (long range), extra life
- Boss at end of each level
- 8 levels

**Controls**:
- D-pad: move ship
- A: shoot (hold for rapid fire)
- B: special weapon

**Levels**:
- Level 1: Basic enemies, slow
- Level 2-4: More enemy types, faster
- Level 5-8: Complex patterns, bosses get harder

**Audio**: `beep()` shoot, `explosion()` enemy kill, `coin()` power-up, `boop()` death

**HUD**: Score, lives, special weapon count, high score

---

### 7. Bounce (Nokia Classic)
**File**: `engine/games/bounce/BounceGame.ts`

**Concept**: Platformer — control red ball through obstacle-filled levels.

**Grid**: 160x144 (side-scrolling)

**Data Structures**:
```typescript
interface Platform {
  x: number;
  y: number;
  w: number;
  type: 'normal' | 'spike' | 'rubber' | 'ice';
}

interface Collectible {
  x: number;
  y: number;
  type: 'ring' | 'crystal' | 'powerup';
}
```

**Mechanics**:
- Ball bounces automatically (hold A for higher jump)
- Collect all rings to unlock exit door
- Avoid spikes (static) and spiders (moving enemies)
- 3 lives
- Checkpoints (yellow diamonds)
- Power-ups: anti-gravity, speed boost, extra life
- Water sections: ball sinks unless enlarged

**Controls**:
- Left/Right: move ball
- A: jump (hold for height)
- B: not used (or power-up)

**Levels**:
- 11 levels across 3 worlds:
  - World 1: Green meadows (simple)
  - World 2: Factory (conveyor belts, pipes)
  - World 3: Cave (water, complex)

**Audio**: `jump()` bounce, `beep()` ring collect, `explosion()` death, `coin()` power-up

**HUD**: Lives (3 balls), rings collected, score, level

---

### 8. Pairs II (Nokia Classic)
**File**: `engine/games/pairs/PairsGame.ts`

**Concept**: Memory matching — flip tiles to find pairs.

**Grid**: 4x4 (8 pairs) to 6x6 (18 pairs)

**Data Structures**:
```typescript
interface Tile {
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  symbol: number;
}
```

**Mechanics**:
- Grid of face-down tiles
- Flip 2 tiles per turn
- If match → tiles stay revealed
- If no match → tiles flip back
- Clear all pairs to win
- Time mode: bomb fuse timer

**Controls**:
- D-pad: move cursor
- A: flip tile
- Start: new game

**Levels**:
- Level 1: 4x4 grid (8 pairs)
- Level 2: 4x5 grid (10 pairs)
- Level 3: 5x6 grid (15 pairs)
- Level 4+: 6x6 grid (18 pairs)

**Audio**: `beep()` flip, `coin()` match found, `explosion()` bomb explode

**HUD**: Pairs found, time remaining, level, best score

---

### 9. Bantumi (Nokia Classic)
**File**: `engine/games/bantumi/BantumiGame.ts`

**Concept**: Mancala strategy — distribute seeds, capture opponent's.

**Grid**: 14 pits (2 rows of 6 + 2 scoring pits)

**Data Structures**:
```typescript
interface Pit {
  seeds: number;
  isStore: boolean;
}
```

**Mechanics**:
- 2-player vs AI
- Select pit → distribute seeds counter-clockwise
- Land in own store → extra turn
- Land in empty own pit → capture opposite seeds
- Game ends when one side empty
- Remaining seeds go to opponent's store

**Controls**:
- Left/Right: select pit
- A: drop seeds
- B: new game

**Levels**:
- Easy AI: random valid moves
- Medium AI: basic strategy
- Hard AI: looks ahead 2-3 moves

**Audio**: `beep()` drop seed, `coin()` capture, `jump()` extra turn

**HUD**: Your store count, AI store count, difficulty level

---

### 10. Minesweeper
**File**: `engine/games/minesweeper/MinesweeperGame.ts`

**Concept**: Classic minesweeper — reveal tiles, avoid mines, use number hints.

**Grid**: 10x10 (beginner), scaling to 16x14 (expert) across levels

**Data Structures**:
```typescript
interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}
```

**Mechanics**:
- Grid of cells, each either mine or safe
- Numbers show adjacent mine count (1-8)
- First click always safe (regenerate if mine)
- Flood-fill reveal for empty cells (0 adjacent mines)
- Flag/unflag with B button
- Win: all non-mine cells revealed
- Lose: reveal a mine

**Controls**:
- D-pad: move cursor
- A: reveal cell
- B: flag/unflag cell
- Start: new game

**Levels**:
- Level 1: 10x10, 10 mines
- Level 2: 12x12, 18 mines
- Level 3: 14x13, 25 mines
- Level 4+: 16x14, 35 mines

**Audio**: `beep()` reveal, `explosion()` mine hit, `coin()` win

**HUD**: Mines remaining, timer, level

---

### 7. Pac-Maze
**File**: `engine/games/pacmaze/PacMazeGame.ts`

**Concept**: Navigate maze, collect all dots, avoid 4 ghosts.

**Grid**: 20x18 tiles (8px each = 160x144)

**Mechanics**:
- TileMap-based maze with walls, dots, power pellets
- Player collects all dots to win level
- 4 ghosts with different AI behaviors
- Power pellet: ghosts become frightened, player can eat them
- Lives system: 3 lives
- Fruit bonus spawns at score thresholds

**Controls**:
- D-pad: change direction

**Levels**:
- Each level uses a different maze layout (5+ designs)
- Ghost speed increases per level

**Audio**: `beep()` dot eat, `coin()` power pellet, `boop()` ghost eat, `explosion()` death

**HUD**: Score, lives, level

---

### 8. Lights Out
**File**: `engine/games/lightsout/LightsOutGame.ts`

**Concept**: 5x5 grid of lights. Toggle a light flips it + 4 neighbors. Turn all off.

**Mechanics**:
- Each cell is ON (color 3) or OFF (color 0)
- Pressing A toggles cell + neighbors
- Goal: turn all cells OFF
- Every puzzle is solvable
- Move counter tracks efficiency

**Controls**:
- D-pad: move cursor
- A: toggle light
- B: new puzzle

**Levels**:
- Level 1-5: 5x5 grid
- Level 6-10: 6x6 grid
- Level 11+: 7x7 grid

**Audio**: `beep()` toggle, `coin()` puzzle solved

**HUD**: Moves count, level, best moves

---

### 9. Memory / Simon
**File**: `engine/games/memory/MemoryGame.ts`

**Concept**: Watch sequence of flashes, repeat it back. Sequence grows each round.

**Layout**: 4 large colored rectangles

**Mechanics**:
- 4 colored panels, each with a unique tone
- Sequence plays automatically (flash + sound)
- Player repeats the sequence in order
- Each round adds one random step
- 3 lives

**Controls**:
- Up/Down/Left/Right: select panel

**Levels**:
- Speed increases per 5 successful rounds

**Audio**: 4 distinct tones via `playTone()`

**HUD**: Round number, lives, high score

---

### 10. Columns / Match-3
**File**: `engine/games/columns/ColumnsGame.ts`

**Concept**: Falling column of 3 gems. Match 3+ of same color to clear.

**Grid**: 6 columns x 12 rows

**Mechanics**:
- Column of 3 gems falls from top
- Rotate gems vertically (A button)
- Move left/right
- Match 3+ vertically, horizontally, or diagonally
- Chain reactions for bonus

**Controls**:
- Left/Right: move column
- A: rotate gems
- Down: soft drop
- B: hard drop

**Levels**:
- Speed increases every 10 lines
- New color at level 5

**Audio**: `beep()` rotate, `coin()` match, `jump()` chain

**HUD**: Score, level, lines cleared, next preview

---

### 11. Sokoban
**File**: `engine/games/sokoban/SokobanGame.ts`

**Concept**: Push boxes onto target tiles. Classic warehouse puzzle.

**Mechanics**:
- Player pushes boxes onto target tiles
- Can't pull boxes or push two at once
- Win when all targets have boxes
- Undo last move with B

**Controls**:
- D-pad: move/push
- B: undo move
- Start: restart level

**Levels**:
- 30+ classic puzzles encoded as compact data

**Audio**: `beep()` move, `boop()` push, `coin()` box placed

**HUD**: Level, moves count, boxes remaining

---

### 12. Blackjack
**File**: `engine/games/blackjack/BlackjackGame.ts`

**Concept**: Card game vs dealer. Get closer to 21 without busting.

**Mechanics**:
- Standard blackjack rules
- Chip-based scoring: start with 100 chips
- Double down, split pairs options

**Controls**:
- Left/Right: adjust bet
- A: deal / hit
- B: stand
- Start: new hand

**Levels**:
- Chip milestones: 500 = Amateur, 1000 = Pro, 5000 = Legend

**Audio**: `beep()` card dealt, `coin()` win, `boop()` bust

**HUD**: Hand values, chip count, bet amount

---

### 13. Cross the Road (Frogger-like)
**File**: `engine/games/crossroad/CrossRoadGame.ts`

**Concept**: Guide character across scrolling traffic lanes.

**Mechanics**:
- Player starts at bottom, reach top to score
- Each lane scrolls at different speed/direction
- Collision = death, lose a life
- 5 lives

**Controls**:
- D-pad: move in 4 directions

**Levels**:
- Add more lanes, faster vehicles, river lanes

**Audio**: `jump()` hop, `boop()` hit, `coin()` score

**HUD**: Score, lives, level

---

### 14. Galaga
**File**: `engine/games/galaga/GalagaGame.ts`

**Concept**: Formation shooter — enemies fly in patterns, dive-bomb player.

**Mechanics**:
- Player moves left/right, shoots upward
- Enemies fly in formation, break off to attack
- Kill all enemies → next wave

**Controls**:
- Left/Right: move
- A: shoot

**Levels**:
- More enemies, complex dive patterns per wave

**Audio**: `beep()` shoot, `explosion()` kill, `boop()` death

**HUD**: Score, wave, lives, high score

---

### 15. Arkanoid
**File**: `engine/games/arkanoid/ArkanoidGame.ts`

**Concept**: Breakout with power-ups and curved brick formations.

**Mechanics**:
- Ball physics with angle based on paddle hit
- Power-ups: wide paddle, multi-ball, laser, slow ball, extra life
- Boss stages every 5 levels

**Controls**:
- Left/Right: move paddle
- A: shoot (if laser active)

**Levels**:
- 20+ hand-designed formations
- Boss stages at 5, 10, 15, 20

**Audio**: `beep()` bounce, `explosion()` brick break, `coin()` power-up

**HUD**: Score, lives, level, power-up indicator

---

## Implementation Order

### Phase 1: Nokia Classics (Build First)
6. Space Impact → 7. Bounce → 8. Pairs II → 9. Bantumi

### Phase 2: Multi-Level Upgrades
1. Bomberman → 2. Invaders → 3. Breakout → 4. Flappy → 5. Snake2

### Phase 3: Simple New Games
10. Minesweeper → 11. Lights Out → 12. Memory/Simon → 13. Sokoban

### Phase 4: Medium New Games
14. Pac-Maze → 15. Columns/Match-3 → 16. Cross the Road → 17. Blackjack

### Phase 5: Complex New Games
18. Galaga → 19. Arkanoid

---

## Quality Standards (Mandatory for All Games)

### File Structure
```
src/engine/games/<gameName>/
  <GameName>Game.ts
```

### Required Imports
```typescript
import { Game, Sprite } from '@/engine/api';
import type { Renderer, GamePadState } from '@/lib/types';
import { SaveState } from '@/engine/core';
import { GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT } from '@/lib/constants';
```

### Class Requirements
- Extends `Game`
- `readonly gameId` matches registry `id`
- Implements: `init()`, `update()`, `draw()`, `getScore()`, `getHighScore()`, `isGameOver()`, `saveState()`, `loadState()`
- Private save state interface

### HUD Standards
- Separator line: `renderer.drawRect(0, HUD_HEIGHT, GAME_WIDTH, 1, 2)`
- Score: `y=4`, color `3`
- Labels: color `2`
- Font: 8x8 (default)

### Color Rules
| Index | Usage |
|-------|-------|
| 0 | Background, overlays |
| 1 | Highlights, subtle elements |
| 2 | Walls, UI, enemies, labels |
| 3 | Player, score, foreground |

### Audio Rules
- `explosion()` on death (mandatory)
- `coin()` for collection/scoring
- `beep()` for bounces/rotations
- `boop()` for hits/drops
- `jump()` for special events

### Input Rules
- Held state for continuous movement
- Rising-edge detection for single-press
- Track previous frame state

### Ready State
- 2-second countdown before gameplay
- Display "GET READY"
- Freeze gameplay

### Save/Load Rules
- Private TypeScript interface
- Deep copy all arrays/objects
- Load high score in `init()`
- Save high score on new record
- Reset `_gameOver = false` in `loadState()`

### High Score
- `HIGHSCORE_KEY = '<name>_highscore'`
- Loaded in `init()`
- Saved when score beats high score

### Game Over
- Set `_gameOver = true`
- Call `this.audio.explosion()`
- Save high score if beaten

### Registration
- Entry in `registry.ts`
- Re-export in `games/index.ts`

---

## Build & Test Protocol

**Per Game:**
1. `pnpm build` — must compile
2. `pnpm start` — run production
3. Browser test:
   - Loads from menu
   - Ready state displays
   - Gameplay works
   - Score increments
   - Game over triggers
   - High score saves
   - Pause/continue works
   - Restart works
   - Touch controls work
4. Save/load test:
   - Pause mid-game
   - Refresh page
   - Continue — state restored
5. Display modes: DMG, Pocket, Light
6. `pnpm lint` — no new errors

---

## Game Registry Updates

Each new game requires entry in `engine/games/registry.ts`:
```typescript
// Nokia Classics
{
  id: 'spaceimpact',
  name: 'SPACE IMPACT',
  description: 'Nokia space shooter',
  create: () => new SpaceImpactGame(),
}
{
  id: 'bounce',
  name: 'BOUNCE',
  description: 'Nokia red ball platformer',
  create: () => new BounceGame(),
}
{
  id: 'pairs',
  name: 'PAIRS II',
  description: 'Nokia memory matching',
  create: () => new PairsGame(),
}
{
  id: 'bantumi',
  name: 'BANTUMI',
  description: 'Nokia mancala strategy',
  create: () => new BantumiGame(),
}
// New Games
{
  id: 'minesweeper',
  name: 'MINESWEEPER',
  description: 'Reveal tiles, avoid mines',
  create: () => new MinesweeperGame(),
}
```

And re-export in `engine/games/index.ts`:
```typescript
// Nokia Classics
export { SpaceImpactGame } from './spaceimpact/SpaceImpactGame';
export { BounceGame } from './bounce/BounceGame';
export { PairsGame } from './pairs/PairsGame';
export { BantumiGame } from './bantumi/BantumiGame';
// New Games
export { MinesweeperGame } from './minesweeper/MinesweeperGame';
```

---

## Testing Checklist

After each game:
- [ ] `pnpm build` compiles
- [ ] Game appears in menu
- [ ] Game loads and plays
- [ ] Save/load state works
- [ ] High score persists
- [ ] Sound effects work
- [ ] All display modes (DMG, Pocket, Light)
- [ ] Touch controls work
- [ ] No memory leaks
- [ ] deltaTime in seconds

---

## Game Summary

| # | Game | Type | Source | Build Order |
|---|------|------|--------|-------------|
| 6 | Space Impact | Shooter | Nokia Classic | 1st |
| 7 | Bounce | Platformer | Nokia Classic | 2nd |
| 8 | Pairs II | Puzzle | Nokia Classic | 3rd |
| 9 | Bantumi | Strategy | Nokia Classic | 4th |
| 1 | Bomberman | Action | Upgrade | 5th |
| 2 | Invaders | Shooter | Upgrade | 6th |
| 3 | Breakout | Arcade | Upgrade | 7th |
| 4 | Flappy | Arcade | Upgrade | 8th |
| 5 | Snake2 | Arcade | Upgrade | 9th |
| 10 | Minesweeper | Puzzle | New | 10th |
| 11 | Lights Out | Puzzle | New | 11th |
| 12 | Memory/Simon | Puzzle | New | 12th |
| 13 | Sokoban | Puzzle | New | 13th |
| 14 | Pac-Maze | Arcade | New | 14th |
| 15 | Columns/Match-3 | Puzzle | New | 15th |
| 16 | Cross the Road | Arcade | New | 16th |
| 17 | Blackjack | Card | New | 17th |
| 18 | Galaga | Shooter | New | 18th |
| 19 | Arkanoid | Arcade | New | 19th |
