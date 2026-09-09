# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile.spec.ts >> Mobile Viewport >> should not scroll when pressing controls
- Location: tests/e2e/mobile.spec.ts:23:7

# Error details

```
Error: locator.tap: The page does not support tap. Use hasTouch context option to enable touch support.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "GameBoy Emulator" [level=1] [ref=e3]
    - generic [ref=e4]:
      - paragraph [ref=e8]: Dot Matrix with Stereo Sound
      - generic [ref=e9]:
        - paragraph [ref=e13]: INSERTCARTRIDGE
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]:
              - button "Up" [ref=e18]
              - button "Down" [ref=e21]
              - button "Left" [ref=e24]
              - button "Right" [ref=e27]
            - generic [ref=e30]:
              - button "B button" [ref=e31]: B
              - button "A button" [ref=e32]: A
          - generic [ref=e34]:
            - button "Select button" [ref=e35]: Select
            - button "Start button" [ref=e36]: Start
      - paragraph [ref=e38]: Nintendo
    - generic [ref=e82]:
      - button "Load ROM" [ref=e84]
      - generic [ref=e85]:
        - generic [ref=e86]: VOL
        - slider "Volume" [ref=e87]: "0.5"
  - button "Open Next.js Dev Tools" [ref=e93] [cursor=pointer]
  - alert [ref=e97]
```

# Test source

```ts
  1  | /**
  2  |  * @file mobile.spec.ts
  3  |  * @description E2E tests for mobile viewport and touch controls.
  4  |  */
  5  | 
  6  | import { test, expect } from '@playwright/test';
  7  | 
  8  | test.describe('Mobile Viewport', () => {
  9  |   test.use({ viewport: { width: 375, height: 812 } }); // iPhone size
  10 | 
  11 |   test.beforeEach(async ({ page }) => {
  12 |     await page.goto('/');
  13 |   });
  14 | 
  15 |   test('should render touch controls on mobile', async ({ page }) => {
  16 |     await expect(page.locator('[data-testid="dpad"]')).toBeVisible();
  17 |     await expect(page.locator('[data-testid="btn-a"]')).toBeVisible();
  18 |     await expect(page.locator('[data-testid="btn-b"]')).toBeVisible();
  19 |     await expect(page.locator('[data-testid="btn-start"]')).toBeVisible();
  20 |     await expect(page.locator('[data-testid="btn-select"]')).toBeVisible();
  21 |   });
  22 | 
  23 |   test('should not scroll when pressing controls', async ({ page }) => {
  24 |     // Tap the D-pad up button
> 25 |     await page.locator('[data-testid="dpad-up"]').tap();
     |                                                   ^ Error: locator.tap: The page does not support tap. Use hasTouch context option to enable touch support.
  26 | 
  27 |     // Page should still be at scroll position 0
  28 |     const scrollY = await page.evaluate(() => window.scrollY);
  29 |     expect(scrollY).toBe(0);
  30 |   });
  31 | 
  32 |   test('should not scroll when pressing A button', async ({ page }) => {
  33 |     await page.locator('[data-testid="btn-a"]').tap();
  34 |     const scrollY = await page.evaluate(() => window.scrollY);
  35 |     expect(scrollY).toBe(0);
  36 |   });
  37 | });
```