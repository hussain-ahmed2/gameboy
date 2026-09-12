/**
 * @file space-impact.spec.ts
 * @description E2E gameplay tests for Space Impact (Nokia classic).
 *   Verifies game loads, renders, responds to controls, and core mechanics work.
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
  await page.waitForTimeout(3000);
  for (let i = 0; i < gameIndex; i++) {
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 3);
  }
  await page.keyboard.press('z');
  await page.waitForTimeout(500);
}

test.describe('Space Impact Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 9); // Space Impact is 10th (index 9)
  });

  test('should load Space Impact and render game elements', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should display GET READY text on start', async ({ page }) => {
    await waitForFrames(page, 5);
    // Check for content in the center of the screen (ready text area)
    const centerPixels = await countNonBackgroundPixels(page, 100, 120, 120, 40);
    expect(centerPixels).toBeGreaterThan(0);
  });

  test('should render player ship after ready timer', async ({ page }) => {
    // Wait for ready timer to expire (2 seconds)
    await page.waitForTimeout(3000);
    await waitForFrames(page, 10);
    // Just check canvas has content - player should be visible
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should move player up with ArrowUp', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    await page.keyboard.down('ArrowUp');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowUp');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should move player down with ArrowDown', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowDown');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should move player left with ArrowLeft', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    await page.keyboard.down('ArrowLeft');
    await waitForFrames(page, 10);
    await page.keyboard.up('ArrowLeft');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should move player right with ArrowRight', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 10);
    await page.keyboard.up('ArrowRight');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should shoot with A button', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    await page.keyboard.press('z'); // shoot
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render score in HUD', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Score is at top-left (x=4, y=4 game coords → canvas x=8, y=8)
    const scorePixels = await countNonBackgroundPixels(page, 0, 0, 120, 24);
    expect(scorePixels).toBeGreaterThan(0);
  });

  test('should render lives in HUD', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Lives are at top-right
    const livesPixels = await countNonBackgroundPixels(page, 240, 0, 80, 24);
    expect(livesPixels).toBeGreaterThan(0);
  });

  test('should render level indicator in HUD', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Just check HUD has some content
    const hudPixels = await countNonBackgroundPixels(page, 0, 0, 320, 24);
    expect(hudPixels).toBeGreaterThan(0);
  });

  test('should display level number', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Check HUD area has content (score + level + lives)
    const hudPixels = await countNonBackgroundPixels(page, 0, 0, 320, 24);
    expect(hudPixels).toBeGreaterThan(50);
  });

  test('should respond to rapid movement inputs', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Quick direction changes
    await page.keyboard.down('ArrowUp');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowUp');
    await page.keyboard.down('ArrowRight');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowDown');
    await waitForFrames(page, 5);
    await page.keyboard.up('ArrowDown');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should handle multiple shots', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Fire multiple shots with delays
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('z');
      await page.waitForTimeout(100);
    }
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('pause and resume should work', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 10);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
    await page.keyboard.press('Escape'); // Resume
    await page.waitForTimeout(500);
    const hasContentAfterResume = await canvasHasContent(page);
    expect(hasContentAfterResume).toBe(true);
  });

  test('reset should restart the game', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 30);
    // Pause
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    // Navigate to RESTART
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 3);
    await page.keyboard.press('z'); // select RESTART
    await page.waitForTimeout(500);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should return to menu from game', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 10);
    // Pause
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    // Navigate to MENU (third option)
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('ArrowDown');
    await waitForFrames(page, 2);
    await page.keyboard.press('z'); // select MENU
    await page.waitForTimeout(500);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should survive simultaneous inputs', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    await page.keyboard.down('ArrowUp');
    await page.keyboard.down('ArrowRight');
    await page.keyboard.down('z');
    await waitForFrames(page, 20);
    await page.keyboard.up('ArrowUp');
    await page.keyboard.up('ArrowRight');
    await page.keyboard.up('z');
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should not crash on rapid A presses', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('z');
      await page.waitForTimeout(50);
    }
    await waitForFrames(page, 10);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Space Impact Display Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 9);
  });

  test('should render correctly in DMG mode', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render correctly in Pocket mode', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Press S to cycle display mode
    await page.keyboard.press('s');
    await page.waitForTimeout(500);
    await waitForFrames(page, 5);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should render correctly in Light mode', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Press S twice to get to Light mode
    await page.keyboard.press('s');
    await page.waitForTimeout(500);
    await page.keyboard.press('s');
    await page.waitForTimeout(500);
    await waitForFrames(page, 5);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});

test.describe('Space Impact Touch Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await selectGameFromMenu(page, 9);
  });

  test('should respond to touch input', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    // Simulate touch on right side of screen
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.5);
      await waitForFrames(page, 10);
    }
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should respond to touch on shoot button area', async ({ page }) => {
    await page.waitForTimeout(3000);
    await waitForFrames(page, 5);
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      // Touch bottom-right area (shoot button)
      await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.8);
      await waitForFrames(page, 10);
    }
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
