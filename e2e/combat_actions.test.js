// e2e/combat_actions.test.js
import { test, expect } from '@playwright/test';

test.describe('Combat UI', () => {
  test.setTimeout(60000);

  test('should render combat action buttons', async ({ page }) => {
    // Start the game and get to a combat encounter
    await page.goto('http://localhost:8000');
    await page.waitForFunction(() => window.gameReady);

    const characterName = 'Combatant';
    await page.fill('#cc-name', characterName);
    await page.click('#btn-start-game');

    // This is a cheat to directly trigger combat for testing purposes
    await page.evaluate(() => {
      window.startCombat(['fungal_beast'], 'SCENE_DEFEAT', 'SCENE_DEFEAT');
    });

    // Wait for the combat UI to be visible
    await page.waitForSelector('#battle-screen:not(.hidden)');

    // Check that the attack button is rendered
    const attackButton = await page.locator('button:has-text("Attack")');
    await expect(attackButton).toBeVisible();
  });
});
