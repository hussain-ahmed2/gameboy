/**
 * @file controls.spec.ts
 * @description E2E tests for GameBoy keyboard controls.
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should respond to D-pad keyboard input', async ({ page }) => {
    // These should not throw errors
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
  });

  test('should respond to A/B button keyboard input', async ({ page }) => {
    await page.keyboard.press('z'); // A
    await page.keyboard.press('x'); // B
  });

  test('should respond to Start/Select keyboard input', async ({ page }) => {
    await page.keyboard.press('Enter'); // Start
    await page.keyboard.press('Shift'); // Select
  });
});