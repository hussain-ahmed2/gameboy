/**
 * @file toolbar.spec.ts
 * @description E2E tests for in-screen menu navigation.
 *   The old React toolbar is removed; game selection now happens
 *   via the canvas-rendered menu using keyboard/touch input.
 */

import { test, expect } from '@playwright/test';

async function waitForFrames(page: import('@playwright/test').Page, count: number) {
  for (let i = 0; i < count; i++) {
    await page.waitForTimeout(16);
  }
}

test.describe('In-Screen Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for boot animation (2s) + buffer
    await page.waitForTimeout(3000);
  });

  test('should show menu after boot', async ({ page }) => {
    await expect(page.locator('text=SELECT GAME')).toBeVisible();
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should navigate menu with arrow keys', async ({ page }) => {
    // Menu should be visible
    await expect(page.locator('text=SELECT GAME')).toBeVisible();

    // Press Down to move cursor
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 5);

    // Press Up to move back
    await page.keyboard.press('ArrowUp');
    await waitForFrames(page, 5);

    // Canvas should still have content
    const hasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const lightestGreen = { r: 155, g: 188, b: 15 };
      for (let x = 0; x < 320; x += 10) {
        for (let y = 0; y < 288; y += 10) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const isBg =
            Math.abs(pixel[0] - lightestGreen.r) < 10 &&
            Math.abs(pixel[1] - lightestGreen.g) < 10;
          if (!isBg) return true;
        }
      }
      return false;
    });
    expect(hasContent).toBe(true);
  });

  test('should select game with z key', async ({ page }) => {
    await expect(page.locator('text=SELECT GAME')).toBeVisible();

    // Press z (A button) to select first game
    await page.keyboard.press('z');
    await page.waitForTimeout(500);

    // Status should now show PLAYING
    await expect(page.locator('text=PLAYING')).toBeVisible();
  });

  test('should pause with Escape', async ({ page }) => {
    // Select a game first
    await page.keyboard.press('z');
    await page.waitForTimeout(500);
    await expect(page.locator('text=PLAYING')).toBeVisible();

    // Pause with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=PAUSED')).toBeVisible();
  });

  test('should resume with Escape', async ({ page }) => {
    // Select and pause
    await page.keyboard.press('z');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=PAUSED')).toBeVisible();

    // Resume with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=PLAYING')).toBeVisible();
  });
});
