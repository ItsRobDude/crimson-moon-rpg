// e2e/load_game.test.js
import { test, expect } from '@playwright/test';

test.describe('Game Loading', () => {
  test.setTimeout(60000);

  test('should load a saved game and display the correct character name', async ({ page }) => {
    // Phase 1: Create a character to generate a save file
    await page.goto('http://localhost:8000');
    await page.waitForFunction(() => window.gameReady);

    const characterName = 'Tester';
    await page.fill('#cc-name', characterName);
    await page.click('#btn-start-game');

    // Wait for the game to load and the character name to be displayed
    const charNameElement = await page.waitForSelector('#char-name');
    const displayedName = await charNameElement.textContent();
    expect(displayedName).toBe(characterName);

    // Phase 2: Reload the page and verify the game loads from the save
    await page.reload();
    await page.waitForFunction(() => window.gameReady);

    // Verify that the character creation modal is not visible
    const modal = await page.locator('#char-creation-modal');
    await expect(modal).toHaveClass(/hidden/);

    // Verify that the character name is correctly loaded and displayed
    const loadedCharNameElement = await page.waitForSelector('#char-name');
    const loadedDisplayedName = await loadedCharNameElement.textContent();
    expect(loadedDisplayedName).toBe(characterName);
  });
});
