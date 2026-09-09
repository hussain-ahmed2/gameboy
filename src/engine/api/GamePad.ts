/**
 * @file GamePad.ts
 * @description GamePad button constants and helpers.
 *   Re-exports GamePadState from types for convenience.
 */

export type GamePadState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  start: boolean;
  select: boolean;
};

/** Button name constants */
export const Button = {
  Up: 'up' as const,
  Down: 'down' as const,
  Left: 'left' as const,
  Right: 'right' as const,
  A: 'a' as const,
  B: 'b' as const,
  Start: 'start' as const,
  Select: 'select' as const,
} as const;

/** Direction buttons */
export const DirectionButtons = [Button.Up, Button.Down, Button.Left, Button.Right] as const;

/** Action buttons */
export const ActionButtons = [Button.A, Button.B] as const;

/** Meta buttons */
export const MetaButtons = [Button.Start, Button.Select] as const;

/** All button keys */
export const AllButtons = [
  Button.Up,
  Button.Down,
  Button.Left,
  Button.Right,
  Button.A,
  Button.B,
  Button.Start,
  Button.Select,
] as const;

/** Check if any direction is pressed */
export function anyDirectionPressed(state: GamePadState): boolean {
  return state.up || state.down || state.left || state.right;
}

/** Get direction vector from gamepad state */
export function getDirectionVector(state: GamePadState): { x: number; y: number } {
  let x = 0, y = 0;
  if (state.left) x -= 1;
  if (state.right) x += 1;
  if (state.up) y -= 1;
  if (state.down) y += 1;
  return { x, y };
}