// __tests__/bootstrap_resilience.test.js
import { test, expect } from '@playwright/test';

test.describe('Game Bootstrap & Resilience', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
     // Ensure we start with a clean state for each test if needed
  });

  test('Clean load should show Start Menu, then New Game triggers Character Creation', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.evaluate(() => localStorage.removeItem('crimson_moon_save'));
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    // Check for Start Menu
    const startMenu = page.locator('#start-menu');
    await expect(startMenu).toBeVisible();

    // Check "Continue" is disabled or indicates no save
    const btnContinue = page.locator('#btn-start-continue');
    await expect(btnContinue).toBeDisabled();

    // Click New Game
    await page.click('#btn-start-new');

    // Check for CC modal
    await expect(page.locator('#char-creation-modal')).not.toHaveClass(/hidden/);
    await expect(startMenu).toHaveClass(/hidden/); // Menu should hide
  });

  test('Valid save should enable Continue and load game', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForFunction(() => window.gameReady);

    // Create a character to generate a save (via UI flow)
    // 1. New Game
    const startMenu = page.locator('#start-menu');
    if (await startMenu.isVisible()) {
        await page.click('#btn-start-new');
        // Handle confirm dialog if it appears
        page.on('dialog', dialog => dialog.accept());
    }

    // 2. CC
    await page.fill('#cc-name', 'BootstrapTester');
    await page.click('#btn-start-game');

    // Check we are in game
    await expect(page.locator('#char-name')).toHaveText('BootstrapTester');

    // Debug: Force a save just in case (though app should do it)
    // await page.evaluate(() => window.saveGame && window.saveGame());

    // Verify save exists
    const saveState = await page.evaluate(() => localStorage.getItem('crimson_moon_save'));
    console.log("SAVE STATE BEFORE RELOAD:", saveState ? "EXISTS" : "NULL");
    expect(saveState).not.toBeNull();

    // Reload
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    // Check Start Menu appears
    await expect(startMenu).toBeVisible();

    // Debug: Check save existence after reload
    const saveStateAfter = await page.evaluate(() => localStorage.getItem('crimson_moon_save'));
    console.log("SAVE STATE AFTER RELOAD:", saveStateAfter ? "EXISTS" : "NULL");

    // Check Continue is enabled
    const btnContinue = page.locator('#btn-start-continue');
    await expect(btnContinue).toBeEnabled();

    // Click Continue
    await page.click('#btn-start-continue');

    // Should be back in game, not CC, menu hidden
    await expect(page.locator('#char-name')).toHaveText('BootstrapTester');
    await expect(page.locator('#char-creation-modal')).toHaveClass(/hidden/);
    await expect(startMenu).toHaveClass(/hidden/);
  });
});
