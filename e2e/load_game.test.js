// e2e/load_game.test.js
import { test, expect } from '@playwright/test';

test.describe('Game Loading', () => {
  test.setTimeout(60000);

  test('should load a saved game and display the correct character name', async ({ page }) => {
    // Phase 1: Create a character to generate a save file
    await page.goto('/');
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

  test('mid-combat continue restores a coherent battle submenu instead of a dead branch', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'Midcombat');
    await page.click('#btn-start-game');
    await page.waitForSelector('#char-name');

    await page.evaluate(() => window.goToScene('SCENE_SPOREFALL_NORTH_AMBUSH'));
    await page.waitForFunction(() => window.gameState.combat?.active);

    await page.evaluate(async () => {
      const combatModule = await import('/combat.js');
      const combat = window.gameState.combat;
      const playerIndex = combat.turnOrder.indexOf('player');
      combat.turnIndex = playerIndex >= 0 ? playerIndex : 0;
      combat.activeActorId = 'player';
      combatModule.uiHooks.updateCombatUI('player');
    });

    await page.getByRole('button', { name: 'Class Features' }).click();
    await expect(page.locator('#battle-actions-container')).toContainText('Second Wind');
    await page.evaluate(() => document.getElementById('btn-save')?.click());
    await page.waitForFunction(() => !!window.localStorage.getItem('crimson_moon_save'));

    await page.reload();
    await page.waitForFunction(() => window.gameReady);
    await page.click('#btn-start-continue');

    await expect(page.locator('#battle-screen')).not.toHaveClass(/hidden/);
    await expect(page.locator('#battle-turn-summary')).toContainText('Action');
    await expect(page.locator('#battle-guidance-text')).not.toBeEmpty();
    await expect(page.locator('#battle-actions-container')).toContainText('Second Wind');
    await expect(page.locator('#battle-actions-container')).toContainText('Back');
    await expect(page.locator('#battle-log-section')).not.toContainText('not ready in this build yet');
  });
});
