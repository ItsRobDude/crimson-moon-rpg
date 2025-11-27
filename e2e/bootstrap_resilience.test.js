// __tests__/bootstrap_resilience.test.js
import { test, expect } from '@playwright/test';

test.describe('Game Bootstrap & Resilience', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
     // Ensure we start with a clean state for each test if needed,
     // but for these specific tests we manage state explicitly.
  });

  test('Clean load should show character creation', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.evaluate(() => localStorage.removeItem('crimson_moon_save'));
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    // Check for CC modal
    await expect(page.locator('#char-creation-modal')).not.toHaveClass(/hidden/);
  });

  test('Valid save should load game', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForFunction(() => window.gameReady);

    // Create a character to generate a save
    await page.fill('#cc-name', 'BootstrapTester');
    // Ensure we select valid options just in case defaults fail
    await page.click('#btn-start-game');

    // Check we are in game
    await expect(page.locator('#char-name')).toHaveText('BootstrapTester');

    // Reload
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    // Should be back in game, not CC
    await expect(page.locator('#char-name')).toHaveText('BootstrapTester');
    await expect(page.locator('#char-creation-modal')).toHaveClass(/hidden/);
  });

  test('Corrupted save should trigger fallback to character creation', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForFunction(() => window.gameReady);

    // Inject corrupted save
    await page.evaluate(() => {
        localStorage.setItem('crimson_moon_save', '{ "corrupt": "json", '); // Invalid JSON
    });

    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    // Console should show error (optional check)
    // Should be in CC
    await expect(page.locator('#char-creation-modal')).not.toHaveClass(/hidden/);

    // Verify save was cleaned up
    const saved = await page.evaluate(() => localStorage.getItem('crimson_moon_save'));
    expect(saved).toBeNull();
  });
});
