/**
 * @file Input.ts
 * @description Keyboard and touch input handling for GameBoy-style gamepad.
 *   Provides button state with edge detection (just pressed/released).
 */

import type { GamePadState } from '@/lib/types';
import { KEY_MAP } from '@/lib/constants';

/** Initial gamepad state (all buttons released) */
const initialState: GamePadState = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
  start: false,
  select: false,
};

/** Map from GameBoyButton to internal state key */
const buttonToKey: Record<string, keyof GamePadState> = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
  A: 'a',
  B: 'b',
  Start: 'start',
  Select: 'select',
};

export class Input {
  private state: GamePadState = { ...initialState };
  private previousState: GamePadState = { ...initialState };
  private keyboardHandlersAttached = false;
  private touchHandlersAttached = false;

  constructor() {
    this.attachKeyboardHandlers();
  }

  /** Attach keyboard event listeners */
  private attachKeyboardHandlers(): void {
    if (this.keyboardHandlersAttached) return;
    this.keyboardHandlersAttached = true;

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  /** Attach touch event listeners for on-screen buttons */
  attachTouchHandlers(getButtonElement: (button: string) => HTMLElement | null): void {
    if (this.touchHandlersAttached) return;
    this.touchHandlersAttached = true;

    const buttons = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'] as const;
    
    buttons.forEach((btn) => {
      const el = getButtonElement(btn);
      if (!el) return;

      const handlePress = (e: TouchEvent) => {
        e.preventDefault();
        this.setButton(btn, true);
      };
      const handleRelease = (e: TouchEvent) => {
        e.preventDefault();
        this.setButton(btn, false);
      };

      el.addEventListener('touchstart', handlePress, { passive: false });
      el.addEventListener('touchend', handleRelease, { passive: false });
      el.addEventListener('touchcancel', handleRelease, { passive: false });
      
      // Also support mouse for desktop testing
      el.addEventListener('mousedown', handlePress);
      el.addEventListener('mouseup', handleRelease);
      el.addEventListener('mouseleave', handleRelease);
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const button = KEY_MAP[e.key];
    if (button) {
      e.preventDefault();
      this.setButton(buttonToKey[button], true);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const button = KEY_MAP[e.key];
    if (button) {
      e.preventDefault();
      this.setButton(buttonToKey[button], false);
    }
  }

  /** Set a button's pressed state */
  setButton(button: keyof GamePadState, pressed: boolean): void {
    this.state[button] = pressed;
  }

  /** Get current button state (read-only) */
  getState(): Readonly<GamePadState> {
    return this.state;
  }

  /** Check if a button is currently pressed */
  isPressed(button: keyof GamePadState): boolean {
    return this.state[button];
  }

  /** Check if a button was just pressed this frame */
  isJustPressed(button: keyof GamePadState): boolean {
    return this.state[button] && !this.previousState[button];
  }

  /** Check if a button was just released this frame */
  isJustReleased(button: keyof GamePadState): boolean {
    return !this.state[button] && this.previousState[button];
  }

  /** Call once per frame to update previous state for edge detection */
  update(): void {
    this.previousState = { ...this.state };
  }

  /** Reset all buttons to released */
  reset(): void {
    this.state = { ...initialState };
    this.previousState = { ...initialState };
  }
}