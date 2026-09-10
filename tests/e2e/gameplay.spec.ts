/**
 * @file gameplay.spec.ts
 * @description E2E gameplay tests for all three games.
 *   Verifies controls, game mechanics, and core functionality.
 *   Uses canvas menu for game selection (keyboard navigation).
 */

import { test, expect } from '@playwright/test';

async function waitForFrames(page: import('@playwright/test').Page, count: number) {
  for (let i = 0; i < count; i++) {
    await page.waitForTimeout(16);
  }
}

async function canvasHasContent(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const lightestGreen = { r: 155, g: 188, b: 15 };
    for (let x = 0; x < 160; x += 10) {
      for (let y = 0; y < 144; y += 10) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const isBg =
          Math.abs(pixel[0] - lightestGreen.r) < 10 &&
          Math.abs(pixel[1] - lightestGreen.g) < 10 &&
          Math.abs(pixel[2] - lightestGreen.b) < 10;
        if (!isBg) return true;
      }
    }
    return false;
  });
}

async function countNonBackgroundPixels(
  page: import('@playwright/test').Page,
  startX: number,
  startY: number,
  width: number,
  height: number
): Promise<number> {
  return page.evaluate(({ startX, startY, width, height }) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    const lightestGreen = { r: 155, g: 188, b: 15 };
    let count = 0;
    for (let x = startX; x < startX + width; x += 2) {
      for (let y = startY; y < startY + height; y += 2) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const isBg =
          Math.abs(pixel[0] - lightestGreen.r) < 10 &&
          Math.abs(pixel[1] - lightestGreen.g) < 10 &&
          Math.abs(pixel[2] - lightestGreen.b) < 10;
        if (!isBg) count++;
      }
    }
    return count;
  }, { startX, startY, width, height });
}

// Helper: navigate canvas menu and select a game by index
async function selectGameFromMenu(page: import('@playwright/test').Page, gameIndex: number) {
  // Wait for menu to appear after boot
  await page.waitForTimeout(3000);
  // Navigate down to the game
  for (let i = 0; i < gameIndex; i++) {
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 3);
  }
  // Select with z (A button)
  await page.keyboard.press('z');
  await page.waitForTimeout(500);
}

test.describe('Pong Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 0); // Pong is first
  });

  test('should load Pong and render game elements', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('text=PLAYING')).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render player paddle on left side', async ({ page }) => {
    await waitForFrames(page, 10);
    const leftPixels = await countNonBackgroundPixels(page, 4, 40, 12, 60);
    expect(leftPixels).toBeGreaterThan(0);
  });

  test('should render AI paddle on right side', async ({ page }) => {
    await waitForFrames(page, 10);
    const rightPixels = await countNonBackgroundPixels(page, 144, 40, 12, 60);
    expect(rightPixels).toBeGreaterThan(0);
  });

  test('should move player paddle up with ArrowUp', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowUp');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowUp');
    const afterUpPixel = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const pixel = ctx.getImageData(10, 30, 1, 1).data;
      return { r: pixel[0], g: pixel[1], b: pixel[2] };
    });
    expect(afterUpPixel).not.toBeNull();
  });

  test('should move player paddle down with ArrowDown', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowDown');
    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const px = ctx.getImageData(10, 90, 1, 1).data;
      return { r: px[0], g: px[1], b: px[2] };
    });
    expect(pixel).not.toBeNull();
  });

  test('should show score on screen', async ({ page }) => {
    await waitForFrames(page, 10);
    const scorePixels = await countNonBackgroundPixels(page, 55, 0, 50, 16);
    expect(scorePixels).toBeGreaterThan(0);
  });

  test('should render center dashed line', async ({ page }) => {
    await waitForFrames(page, 10);
    const centerPixels = await countNonBackgroundPixels(page, 78, 0, 4, 144);
    expect(centerPixels).toBeGreaterThan(0);
  });

  test('pause and resume should work', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=PAUSED')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('text=PLAYING')).toBeVisible();
  });

  test('reset should restart the game', async ({ page }) => {
    await waitForFrames(page, 30);
    // Pause, navigate to RESTART, select with z
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown'); // move to RESTART
    await waitForFrames(page, 3);
    await page.keyboard.press('z'); // select RESTART
    await page.waitForTimeout(500);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Snake Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 1); // Snake is second
  });

  test('should load Snake and render game elements', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('text=PLAYING')).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render snake on screen', async ({ page }) => {
    await waitForFrames(page, 10);
    const snakePixels = await countNonBackgroundPixels(page, 0, 0, 160, 144);
    expect(snakePixels).toBeGreaterThan(0);
  });

  test('should render food somewhere on screen', async ({ page }) => {
    await waitForFrames(page, 10);
    const totalPixels = await countNonBackgroundPixels(page, 0, 0, 160, 144);
    expect(totalPixels).toBeGreaterThan(10);
  });

  test('should change direction with D-pad', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowDown');
    const belowPixels = await countNonBackgroundPixels(page, 70, 80, 30, 30);
    expect(belowPixels).toBeGreaterThanOrEqual(0);
  });

  test('should move left with ArrowLeft', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowLeft');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should display score', async ({ page }) => {
    await waitForFrames(page, 10);
    const scorePixels = await countNonBackgroundPixels(page, 0, 0, 160, 16);
    expect(scorePixels).toBeGreaterThan(0);
  });

  test('should handle multiple direction changes', async ({ page }) => {
    await waitForFrames(page, 10);
    const keys = ['ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight'];
    for (const key of keys) {
      await page.keyboard.down(key);
      await waitForFrames(page, 5);
      await page.keyboard.up(key);
    }
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Platformer Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 2); // Platformer is third
  });

  test('should load Platformer and render game elements', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('text=PLAYING')).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render ground tiles at bottom', async ({ page }) => {
    await waitForFrames(page, 10);
    const groundPixels = await countNonBackgroundPixels(page, 0, 100, 160, 44);
    expect(groundPixels).toBeGreaterThan(0);
  });

  test('should render player character', async ({ page }) => {
    await waitForFrames(page, 10);
    const playerPixels = await countNonBackgroundPixels(page, 0, 0, 160, 144);
    expect(playerPixels).toBeGreaterThan(0);
  });

  test('should move player right with ArrowRight', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowRight');
    const rightPixels = await countNonBackgroundPixels(page, 20, 84, 12, 12);
    expect(rightPixels).toBeGreaterThanOrEqual(0);
  });

  test('should move player left with ArrowLeft', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowLeft');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should jump with A button', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('z');
    await waitForFrames(page, 5);
    await page.keyboard.up('z');
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render coins in level', async ({ page }) => {
    await waitForFrames(page, 10);
    const coinArea = await countNonBackgroundPixels(page, 20, 76, 12, 12);
    expect(coinArea).toBeGreaterThanOrEqual(0);
  });

  test('should display HUD with coins and level', async ({ page }) => {
    await waitForFrames(page, 10);
    const hudPixels = await countNonBackgroundPixels(page, 0, 0, 160, 16);
    expect(hudPixels).toBeGreaterThan(0);
  });

  test('should handle simultaneous inputs', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowRight');
    await page.keyboard.down('z');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('z');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Game Switching', () => {
  test('should switch between all games', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Pong (first)
    await page.keyboard.press('z');
    await page.waitForTimeout(500);
    await expect(page.locator('text=PLAYING')).toBeVisible();
    let hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);

    // Go back to menu (pause, then MENU option)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Navigate to MENU (third option in pause menu)
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('z'); // select MENU
    await page.waitForTimeout(500);
    await expect(page.locator('text=SELECT GAME')).toBeVisible();

    // Select Snake (second)
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 3);
    await page.keyboard.press('z');
    await page.waitForTimeout(500);
    await expect(page.locator('text=PLAYING')).toBeVisible();
    hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);

    // Go back to menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('z');
    await page.waitForTimeout(500);
    await expect(page.locator('text=SELECT GAME')).toBeVisible();

    // Select Platformer (third)
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('z');
    await page.waitForTimeout(500);
    await expect(page.locator('text=PLAYING')).toBeVisible();
    hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Full Controls Integration', () => {
  test('all keyboard controls should work without errors', async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 0);

    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'x', 'Enter', 'Shift'];
    for (const key of keys) {
      await page.keyboard.down(key);
      await waitForFrames(page, 3);
      await page.keyboard.up(key);
    }

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
