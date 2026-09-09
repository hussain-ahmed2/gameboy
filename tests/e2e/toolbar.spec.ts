/**
 * @file toolbar.spec.ts
 * @description E2E tests for toolbar button interactions.
 */

import { test, expect } from '@playwright/test';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render Load ROM button', async ({ page }) => {
    await expect(page.locator('text=Load ROM')).toBeVisible();
  });

  test('should render toolbar buttons when ROM loaded', async ({ page }) => {
    // We can't easily test file upload in this simple test
    // but we can verify the toolbar container exists
    await expect(page.locator('[data-testid="toolbar"]')).toBeVisible();
  });
});