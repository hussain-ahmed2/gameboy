/**
 * @file shell.spec.ts
 * @description E2E tests for GameBoy shell rendering.
 */

import { test, expect } from '@playwright/test';

test.describe('GameBoy Shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render speaker grill', async ({ page }) => {
    const speaker = page.locator('[data-testid="gameboy-shell"] >> text=DOT MATRIX');
    await expect(speaker).toBeVisible();
  });

  test('should have correct shell styling', async ({ page }) => {
    const shell = page.locator('[data-testid="gameboy-shell"]');
    await expect(shell).toHaveClass(/bg-shell/);
  });
});