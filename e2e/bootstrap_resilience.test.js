// __tests__/bootstrap_resilience.test.js
import { test, expect } from '@playwright/test';

test.describe('Game Bootstrap & Resilience', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
     // Ensure we start with a clean state for each test if needed,
     // but for these specific tests we manage state explicitly.
  });

  test('Clean load should show the main menu', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('crimson_moon_save'));
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    await expect(page.locator('#start-menu')).not.toHaveClass(/hidden/);
    await expect(page.locator('#btn-start-continue')).toBeDisabled();
  });

  test('Valid save should be available from Continue', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    // Create a character to generate a save
    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'BootstrapTester');
    // Ensure we select valid options just in case defaults fail
    await page.click('#btn-start-game');

    // Check we are in game
    await expect(page.locator('#char-name')).toHaveText('BootstrapTester');

    // Reload
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    await expect(page.locator('#start-menu')).not.toHaveClass(/hidden/);
    await expect(page.locator('#btn-start-continue')).toBeEnabled();
    await page.click('#btn-start-continue');

    await expect(page.locator('#char-name')).toHaveText('BootstrapTester');
    await expect(page.locator('#char-creation-modal')).toHaveClass(/hidden/);
  });

  test('Corrupted save should fall back to the main menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    // Inject corrupted save
    await page.evaluate(() => {
        localStorage.setItem('crimson_moon_save', '{ "corrupt": "json", '); // Invalid JSON
    });

    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    await expect(page.locator('#start-menu')).not.toHaveClass(/hidden/);
    await expect(page.locator('#btn-start-continue')).toBeDisabled();

    // Verify save was cleaned up
    const saved = await page.evaluate(() => localStorage.getItem('crimson_moon_save'));
    expect(saved).toBeNull();
  });

  test('Parseable but unusable save payload should still disable Continue', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.evaluate(() => {
      localStorage.setItem('crimson_moon_save', 'true');
    });

    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    await expect(page.locator('#start-menu')).not.toHaveClass(/hidden/);
    await expect(page.locator('#btn-start-continue')).toBeDisabled();

    const saved = await page.evaluate(() => localStorage.getItem('crimson_moon_save'));
    expect(saved).toBeNull();
  });
});
