import { test, expect } from '@playwright/test';

test.describe('Combat Guidance', () => {
  test.setTimeout(60000);

  test('first ambush shows readable combat labels and helper copy', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'CombatGuide');
    await page.click('#btn-start-game');
    await page.waitForSelector('#char-name');

    await page.evaluate(() => window.goToScene('SCENE_SPOREFALL_NORTH_AMBUSH'));
    await page.waitForFunction(() => window.gameState.combat?.active);

    await page.evaluate(async () => {
      const combatModule = await import('/combat.js');
      const playerIndex = window.gameState.combat.turnOrder.indexOf('player');
      window.gameState.combat.turnIndex = playerIndex >= 0 ? playerIndex : 0;
      window.gameState.combat.activeActorId = 'player';
      combatModule.uiHooks.updateCombatUI('player');
    });

    await expect(page.locator('#battle-screen')).not.toHaveClass(/hidden/);
    await expect(page.locator('#battle-turn-summary')).toContainText('Action');
    await expect(page.locator('#battle-guidance-text')).not.toBeEmpty();
    await expect(page.locator('#battle-tutorial-nudge')).toBeVisible();

    const actionContainer = page.locator('#battle-actions-container');
    for (const label of ['Attack', 'Move', 'Cast Spell', 'Class Features', 'Items', 'Defend', 'End Turn']) {
      await expect(actionContainer).toContainText(label);
    }

    const iconsUseMaterialSymbols = await page.locator('#battle-actions-container .material-symbols-outlined').evaluateAll((els) => (
      els.length > 0 && els.every((el) => getComputedStyle(el).fontFamily.toLowerCase().includes('material symbols outlined'))
    ));
    expect(iconsUseMaterialSymbols).toBe(true);

    await page.click('#battle-tutorial-dismiss');
    await expect(page.locator('#battle-tutorial-nudge')).toBeHidden();
  });
});
