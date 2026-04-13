// e2e/load_game.test.js
import { test, expect } from '@playwright/test';

test.describe('Game Loading', () => {
  test.setTimeout(60000);

  test('should load a saved game and display the correct character name', async ({ page }) => {
    // Phase 1: Create a character to generate a save file
    await page.goto('http://localhost:8000');
    await page.waitForFunction(() => window.gameReady);

    const characterName = 'Tester';
    await page.click('#btn-start-new');
    await page.fill('#cc-name', characterName);
    await page.click('#btn-start-game');

    // Wait for the game to load and the character name to be displayed
    const charNameElement = await page.waitForSelector('#char-name');
    const displayedName = await charNameElement.textContent();
    expect(displayedName).toBe(characterName);

    // Phase 2: Reload the page and verify the game loads from the save
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    await expect(page.locator('#start-menu')).not.toHaveClass(/hidden/);
    await expect(page.locator('#btn-start-continue')).toBeEnabled();
    await page.click('#btn-start-continue');

    // Verify that the character name is correctly loaded and displayed
    const loadedCharNameElement = await page.waitForSelector('#char-name');
    const loadedDisplayedName = await loadedCharNameElement.textContent();
    expect(loadedDisplayedName).toBe(characterName);
  });
});
