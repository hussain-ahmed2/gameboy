/**
 * @file app.spec.ts
 * @description E2E tests for the GameBoy emulator app.
 */

import { test, expect } from '@playwright/test';

test.describe('GameBoy Emulator App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/GameBoy Game Engine/);
  });

  test('should render the GameBoy shell', async ({ page }) => {
    await expect(page.locator('[data-testid="gameboy-shell"]')).toBeVisible();
  });

  test('should render the power LED', async ({ page }) => {
    await expect(page.locator('[data-testid="power-led"]')).toBeVisible();
  });

  test('should render the screen bezel', async ({ page }) => {
    await expect(page.locator('[data-testid="screen-bezel"]')).toBeVisible();
  });

  test('should display DOT MATRIX label', async ({ page }) => {
    await expect(page.locator('text=DOT MATRIX WITH STEREO SOUND')).toBeVisible();
  });

  test('should not display Nintendo label', async ({ page }) => {
    await expect(page.locator('text=Nintendo')).not.toBeVisible();
  });
});
