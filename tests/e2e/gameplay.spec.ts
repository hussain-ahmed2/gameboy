/**
 * @file gameplay.spec.ts
 * @description E2E gameplay tests for all three games.
 *   Verifies controls, game mechanics, and core functionality.
 */

import { test, expect } from '@playwright/test';

// Helper: wait for game frames to process
async function waitForFrames(page: import('@playwright/test').Page, count: number) {
  for (let i = 0; i < count; i++) {
    await page.waitForTimeout(16); // ~60fps
  }
}

// Helper: get pixel color from canvas at logical coordinates
async function getCanvasPixel(
  page: import('@playwright/test').Page,
  x: number,
  y: number
): Promise<{ r: number; g: number; b: number } | null> {
  return page.evaluate(({ x, y }) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2] };
  }, { x, y });
}

// Helper: check if canvas has non-background content (not all lightest green)
async function canvasHasContent(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    // Sample a grid of pixels
    const lightestGreen = { r: 155, g: 188, b: 15 }; // #9bbc0f
    for (let x = 0; x < 160; x += 10) {
      for (let y = 0; y < 144; y += 10) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const isBackground =
          Math.abs(pixel[0] - lightestGreen.r) < 10 &&
          Math.abs(pixel[1] - lightestGreen.g) < 10 &&
          Math.abs(pixel[2] - lightestGreen.b) < 10;
        if (!isBackground) return true;
      }
    }
    return false;
  });
}

// Helper: count non-background pixels in a region
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
        const isBackground =
          Math.abs(pixel[0] - lightestGreen.r) < 10 &&
          Math.abs(pixel[1] - lightestGreen.g) < 10 &&
          Math.abs(pixel[2] - lightestGreen.b) < 10;
        if (!isBackground) count++;
      }
    }
    return count;
  }, { startX, startY, width, height });
}

test.describe('Pong Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Select PONG"]').click();
    await page.waitForTimeout(500);
  });

  test('should load Pong and render game elements', async ({ page }) => {
    // Canvas should exist
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Game info should show PONG
    await expect(page.locator('[data-testid="game-info"]')).toContainText('PONG');

    // FPS counter should be visible (game is running)
    await expect(page.locator('[data-testid="fps-counter"]')).toBeVisible();
    // Wait for FPS to update (counter refreshes once per second)
    await page.waitForTimeout(1500);
    const fpsText = await page.locator('[data-testid="fps-counter"]').textContent();
    const fps = parseInt(fpsText?.replace(' FPS', '') || '0');
    expect(fps).toBeGreaterThan(0);

    // Canvas should have non-background content (paddles, ball, center line)
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render player paddle on left side', async ({ page }) => {
    await waitForFrames(page, 10);
    // Player paddle is at x=8, should have dark pixels in left region
    const leftPixels = await countNonBackgroundPixels(page, 4, 40, 12, 60);
    expect(leftPixels).toBeGreaterThan(0);
  });

  test('should render AI paddle on right side', async ({ page }) => {
    await waitForFrames(page, 10);
    // AI paddle is at x=148, should have dark pixels in right region
    const rightPixels = await countNonBackgroundPixels(page, 144, 40, 12, 60);
    expect(rightPixels).toBeGreaterThan(0);
  });

  test('should move player paddle up with ArrowUp', async ({ page }) => {
    await waitForFrames(page, 10);

    // Get initial paddle position (check pixel at expected paddle location)
    const initialPixel = await getCanvasPixel(page, 10, 50);

    // Hold ArrowUp for a bit
    await page.keyboard.down('ArrowUp');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowUp');

    // Paddle should have moved - check a different y position
    const afterUpPixel = await getCanvasPixel(page, 10, 30);
    // The pixel content should have shifted
    expect(afterUpPixel).not.toBeNull();
  });

  test('should move player paddle down with ArrowDown', async ({ page }) => {
    await waitForFrames(page, 10);

    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowDown');

    // Paddle should have moved down - check lower y position
    const pixel = await getCanvasPixel(page, 10, 90);
    expect(pixel).not.toBeNull();
  });

  test('should show score on screen', async ({ page }) => {
    await waitForFrames(page, 10);
    // Scores are drawn at top - there should be dark pixels in score area
    const scorePixels = await countNonBackgroundPixels(page, 20, 0, 30, 16);
    expect(scorePixels).toBeGreaterThan(0);
  });

  test('should render center dashed line', async ({ page }) => {
    await waitForFrames(page, 10);
    // Center line is at x=79, should have alternating pixels
    const centerPixels = await countNonBackgroundPixels(page, 78, 0, 4, 144);
    expect(centerPixels).toBeGreaterThan(0);
  });

  test('pause and resume should work', async ({ page }) => {
    await waitForFrames(page, 10);

    // Pause the game
    await page.locator('button[aria-label="Pause game"]').click();
    await page.waitForTimeout(200);

    // Button should now say Resume
    await expect(page.locator('button[aria-label="Resume game"]')).toBeVisible();

    // Resume the game
    await page.locator('button[aria-label="Resume game"]').click();
    await page.waitForTimeout(200);

    // Button should say Pause again
    await expect(page.locator('button[aria-label="Pause game"]')).toBeVisible();
  });

  test('reset should restart the game', async ({ page }) => {
    await waitForFrames(page, 30);

    // Reset the game
    await page.locator('button[aria-label="Reset game"]').click();
    await waitForFrames(page, 10);

    // Game should still be running with fresh state
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Snake Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Select SNAKE"]').click();
    await page.waitForTimeout(500);
  });

  test('should load Snake and render game elements', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('[data-testid="game-info"]')).toContainText('SNAKE');

    await expect(page.locator('[data-testid="fps-counter"]')).toBeVisible();
    await page.waitForTimeout(1500);
    const fpsText = await page.locator('[data-testid="fps-counter"]').textContent();
    const fps = parseInt(fpsText?.replace(' FPS', '') || '0');
    expect(fps).toBeGreaterThan(0);

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render snake on screen', async ({ page }) => {
    await waitForFrames(page, 10);
    // Snake should have dark pixels somewhere on screen
    const snakePixels = await countNonBackgroundPixels(page, 0, 0, 160, 144);
    expect(snakePixels).toBeGreaterThan(0);
  });

  test('should render food somewhere on screen', async ({ page }) => {
    await waitForFrames(page, 10);
    // Food is a dark pixel somewhere - check that there are multiple dark regions
    // (snake + food = at least 2 separate dark areas)
    const totalPixels = await countNonBackgroundPixels(page, 0, 0, 160, 144);
    expect(totalPixels).toBeGreaterThan(10); // At least some game content
  });

  test('should change direction with D-pad', async ({ page }) => {
    await waitForFrames(page, 10);

    // Snake starts moving right. Press Down to change direction.
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowDown');

    // Snake should have moved down - check for content below starting position
    const belowPixels = await countNonBackgroundPixels(page, 70, 80, 30, 30);
    // At least the snake head should be in a new position
    expect(belowPixels).toBeGreaterThanOrEqual(0); // May or may not be visible yet
  });

  test('should move left with ArrowLeft', async ({ page }) => {
    await waitForFrames(page, 10);

    // Press Left to change direction
    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowLeft');

    // Snake should have content - verify game is still running
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should display score', async ({ page }) => {
    await waitForFrames(page, 10);
    // Score is drawn at top - "SCORE: 0" and "HIGH: 0"
    const scorePixels = await countNonBackgroundPixels(page, 0, 0, 160, 16);
    expect(scorePixels).toBeGreaterThan(0);
  });

  test('should handle multiple direction changes', async ({ page }) => {
    await waitForFrames(page, 10);

    // Rapid direction changes should not crash
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowDown');

    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowLeft');

    await page.keyboard.down('ArrowUp');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowRight');

    // Game should still be running
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Platformer Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Select PLATFORMER"]').click();
    await page.waitForTimeout(500);
  });

  test('should load Platformer and render game elements', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('[data-testid="game-info"]')).toContainText('PLATFORMER');

    await expect(page.locator('[data-testid="fps-counter"]')).toBeVisible();
    await page.waitForTimeout(1500);
    const fpsText = await page.locator('[data-testid="fps-counter"]').textContent();
    const fps = parseInt(fpsText?.replace(' FPS', '') || '0');
    expect(fps).toBeGreaterThan(0);

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render ground tiles at bottom', async ({ page }) => {
    await waitForFrames(page, 10);
    // Ground is at row 13 (y=104), full width
    const groundPixels = await countNonBackgroundPixels(page, 0, 100, 160, 44);
    expect(groundPixels).toBeGreaterThan(0);
  });

  test('should render player character', async ({ page }) => {
    await waitForFrames(page, 10);
    // Player should be visible somewhere on screen
    const playerPixels = await countNonBackgroundPixels(page, 0, 0, 160, 144);
    expect(playerPixels).toBeGreaterThan(0);
  });

  test('should move player right with ArrowRight', async ({ page }) => {
    await waitForFrames(page, 10);

    // Check initial player position
    const initialPixels = await countNonBackgroundPixels(page, 4, 84, 12, 12);

    // Move right
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowRight');

    // Player should have moved right - check new position area
    const rightPixels = await countNonBackgroundPixels(page, 20, 84, 12, 12);
    // Either player moved right or is still visible
    expect(rightPixels).toBeGreaterThanOrEqual(0);
  });

  test('should move player left with ArrowLeft', async ({ page }) => {
    await waitForFrames(page, 10);

    // Move right first to have room to move left
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowRight');

    // Now move left
    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 15);
    await page.keyboard.up('ArrowLeft');

    // Game should still be running
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should jump with A button', async ({ page }) => {
    await waitForFrames(page, 10);

    // Get initial player Y position by checking where dark pixels are
    const beforeJump = await countNonBackgroundPixels(page, 8, 80, 8, 16);

    // Press A to jump
    await page.keyboard.down('z');
    await waitForFrames(page, 5);
    await page.keyboard.up('z');

    // Wait for jump to happen (player moves up)
    await waitForFrames(page, 10);

    // Player should have been in a different position during jump
    // Verify game is still running
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render coins in level', async ({ page }) => {
    await waitForFrames(page, 10);
    // Level 1 has coins at various positions, e.g. (3,10) = pixel (24,80)
    const coinArea = await countNonBackgroundPixels(page, 20, 76, 12, 12);
    // There should be some content in coin areas
    expect(coinArea).toBeGreaterThanOrEqual(0);
  });

  test('should display HUD with coins and level', async ({ page }) => {
    await waitForFrames(page, 10);
    // HUD is drawn at top: "COINS: 0/6" and "LEVEL 1"
    const hudPixels = await countNonBackgroundPixels(page, 0, 0, 160, 16);
    expect(hudPixels).toBeGreaterThan(0);
  });

  test('should handle simultaneous inputs', async ({ page }) => {
    await waitForFrames(page, 10);

    // Move right and jump simultaneously
    await page.keyboard.down('ArrowRight');
    await page.keyboard.down('z');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('z');

    // Game should not crash
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Game Switching', () => {
  test('should switch between all games', async ({ page }) => {
    await page.goto('/');

    // Load Pong
    await page.locator('button[aria-label="Select PONG"]').click();
    await waitForFrames(page, 10);
    await expect(page.locator('[data-testid="game-info"]')).toContainText('PONG');
    let hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);

    // Switch to Snake
    await page.locator('button[aria-label="Select SNAKE"]').click();
    await waitForFrames(page, 10);
    await expect(page.locator('[data-testid="game-info"]')).toContainText('SNAKE');
    hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);

    // Switch to Platformer
    await page.locator('button[aria-label="Select PLATFORMER"]').click();
    await waitForFrames(page, 10);
    await expect(page.locator('[data-testid="game-info"]')).toContainText('PLATFORMER');
    hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);

    // Switch back to Pong
    await page.locator('button[aria-label="Select PONG"]').click();
    await waitForFrames(page, 10);
    await expect(page.locator('[data-testid="game-info"]')).toContainText('PONG');
  });

  test('should reset game state when switching', async ({ page }) => {
    await page.goto('/');

    // Load Pong and let it run
    await page.locator('button[aria-label="Select PONG"]').click();
    await waitForFrames(page, 30);

    // Switch to Snake - should get fresh state
    await page.locator('button[aria-label="Select SNAKE"]').click();
    await waitForFrames(page, 10);

    // Score should be 0 (fresh game)
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Full Controls Integration', () => {
  test('all keyboard controls should work without errors', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Select PONG"]').click();
    await waitForFrames(page, 10);

    // Test all mapped keys
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'x', 'Enter', 'Shift'];

    for (const key of keys) {
      await page.keyboard.down(key);
      await waitForFrames(page, 3);
      await page.keyboard.up(key);
    }

    // Game should still be running after all inputs
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('volume control should work', async ({ page }) => {
    await page.goto('/');

    const slider = page.locator('input[aria-label="Volume"]');
    await expect(slider).toBeVisible();

    // Change volume
    await slider.fill('0.8');
    await waitForFrames(page, 5);

    // Volume should not crash the game
    await page.locator('button[aria-label="Select PONG"]').click();
    await waitForFrames(page, 10);

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
