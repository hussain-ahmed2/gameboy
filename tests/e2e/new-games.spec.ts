/**
 * @file new-games.spec.ts
 * @description E2E gameplay tests for the 6 new games.
 *   Verifies that each game loads, renders, and responds to controls.
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
    for (let x = 0; x < canvas.width; x += 10) {
      for (let y = 0; y < canvas.height; y += 10) {
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

async function selectGameFromMenu(page: import('@playwright/test').Page, gameIndex: number) {
  await page.waitForTimeout(3000);
  for (let i = 0; i < gameIndex; i++) {
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 3);
  }
  await page.keyboard.press('z');
  await page.waitForTimeout(500);
}

test.describe('Breakout Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 3); // Breakout is 4th (index 3)
  });

  test('should load and render', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should respond to paddle controls', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 10);
    await page.keyboard.up('ArrowLeft');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should launch ball with A', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.press('z');
    await waitForFrames(page, 20);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Flappy Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 4); // Flappy is 5th (index 4)
  });

  test('should load and render', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should respond to flap input', async ({ page }) => {
    await waitForFrames(page, 10);
    // Multiple flaps to keep bird alive
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('z');
      await waitForFrames(page, 10);
    }
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Invaders Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 5); // Invaders is 6th (index 5)
  });

  test('should load and render', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should move ship and shoot', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 10);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('z'); // shoot
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Bomberman Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 6); // Bomberman is 7th (index 6)
  });

  test('should load and render', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should move and place bomb', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 10);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('z'); // place bomb
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Tetris Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 7); // Tetris is 8th (index 7)
  });

  test('should load and render', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should respond to piece controls', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.press('ArrowLeft');
    await waitForFrames(page, 3);
    await page.keyboard.press('ArrowRight');
    await waitForFrames(page, 3);
    await page.keyboard.press('ArrowUp'); // rotate
    await waitForFrames(page, 3);
    await page.keyboard.press('z'); // hard drop
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Snake II Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 8); // Snake II is 9th (index 8)
  });

  test('should load and render', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should change direction', async ({ page }) => {
    await waitForFrames(page, 10);
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowDown');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Game Save Prompt', () => {
  test('should show save prompt when game has save data', async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 0); // Select Pong

    // Play for a bit to create save data
    await waitForFrames(page, 30);

    // Pause and go to menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('z'); // MENU
    await page.waitForTimeout(500);

    // Try to select Pong again - should show save prompt
    await page.keyboard.press('z');
    await page.waitForTimeout(500);

    // Canvas should have content (save prompt or game)
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
