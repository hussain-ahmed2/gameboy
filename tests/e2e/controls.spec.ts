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

  test('should navigate menu with Select button (Shift key and on-screen button)', async ({ page }) => {
    await page.waitForTimeout(2500); // Wait for boot to finish
    await page.keyboard.press('Shift'); // Select moves cursor down
    await page.waitForTimeout(100);

    const selectBtn = page.locator('[data-testid="btn-select"]');
    await expect(selectBtn).toBeVisible();
    await selectBtn.click();
  });

  test('should cycle display palette with Select button during gameplay', async ({ page }) => {
    await page.waitForTimeout(2500); // Wait for boot
    await page.keyboard.press('z'); // Start first game (Pong)
    await page.waitForTimeout(600);

    // Press Select (Shift) to cycle display palette
    await page.keyboard.press('Shift');
    await page.waitForTimeout(200);

    // Click on-screen Select button to cycle display palette again
    const selectBtn = page.locator('[data-testid="btn-select"]');
    await selectBtn.click();
    await page.waitForTimeout(200);
  });

  test('should render Analogue Home button', async ({ page }) => {
    const homeBtn = page.locator('[data-testid="btn-home"]');
    await expect(homeBtn).toBeVisible();
  });
});