/**
 * @file mobile.spec.ts
 * @description E2E tests for mobile viewport and touch controls.
 */

import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone size

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="dpad"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-a"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-b"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-start"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-select"]')).toBeVisible();
  });

  test('should not scroll when clicking controls', async ({ page }) => {
    // Click the D-pad up button
    await page.locator('[data-testid="dpad-up"]').click();

    // Page should still be at scroll position 0
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('should not scroll when clicking A button', async ({ page }) => {
    await page.locator('[data-testid="btn-a"]').click();
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});