/**
 * @file toolbar.spec.ts
 * @description E2E tests for toolbar button interactions.
 */

import { test, expect } from '@playwright/test';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render game selector cards', async ({ page }) => {
    await expect(page.locator('[role="radiogroup"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Select PONG"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Select SNAKE"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Select PLATFORMER"]')).toBeVisible();
  });

  test('should render toolbar controls', async ({ page }) => {
    await expect(page.locator('[data-testid="toolbar"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Pause game"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Reset game"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Toggle fullscreen"]')).toBeVisible();
  });

  test('should highlight selected game card', async ({ page }) => {
    const pongCard = page.locator('button[aria-label="Select PONG"]');
    await expect(pongCard).toHaveClass(/border-accent/);
  });

  test('should switch game when clicking card', async ({ page }) => {
    const snakeCard = page.locator('button[aria-label="Select SNAKE"]');
    await snakeCard.click();
    await expect(page.locator('[data-testid="game-info"]')).toContainText('SNAKE');
  });
});
