import { test, expect } from '@playwright/test';

test.describe('Adaptive Combat Guidance', () => {
  test.setTimeout(60000);

  test('combat helper text adapts to engaged, open, and spent-action states', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'Tactician');
    await page.click('#btn-start-game');

    await page.evaluate(() => window.goToScene('SCENE_SPOREFALL_NORTH_AMBUSH'));
    await page.waitForFunction(() => window.gameState.combat?.active);

    await page.evaluate(async () => {
      const combatModule = await import('/combat.js');
      const combat = window.gameState.combat;
      const playerIndex = combat.turnOrder.indexOf('player');
      combat.turnIndex = playerIndex >= 0 ? playerIndex : 0;
      combat.activeActorId = 'player';

      const setPlayerState = (mode) => {
        const playerToken = combat.grid.occupied.player;
        combat.grid.terrain = {};
        const hostileIds = Object.entries(combat.grid.occupied)
          .filter(([tokenId, token]) => tokenId !== 'player' && token.team !== playerToken.team && token.hp > 0)
          .map(([tokenId]) => tokenId);

        hostileIds.forEach((hostileId, index) => {
          combat.grid.occupied[hostileId].x = playerToken.x + 3 + index;
          combat.grid.occupied[hostileId].y = playerToken.y + index;
        });

        combat.actionsRemaining = 1;
        combat.bonusActionsRemaining = 1;
        combat.movementRemaining = 30;

        if (mode === 'engaged' && hostileIds[0]) {
          combat.grid.occupied[hostileIds[0]].x = playerToken.x + 1;
          combat.grid.occupied[hostileIds[0]].y = playerToken.y;
        }

        if (mode === 'spent') {
          combat.actionsRemaining = 0;
          combat.bonusActionsRemaining = 1;
          combat.movementRemaining = 15;
        }

        combatModule.uiHooks.updateCombatUI('player');
      };

      window.__setPlayerCombatState = setPlayerState;
      setPlayerState('engaged');
    });

    await expect(page.locator('#battle-guidance-text')).toContainText('already on you');
    await expect(page.locator('#party-container')).toContainText('Engaged');
    await expect(page.locator('#battle-field-status')).toContainText('Cover and distance live');
    await expect(page.locator('#battle-system-note')).toContainText('Elevation is not modeled');
    expect(await page.locator('#battle-field-grid .battlefield-token').count()).toBeGreaterThan(1);
    await expect(page.locator('#enemies-container')).toContainText('Adjacent');

    await page.evaluate(() => window.__setPlayerCombatState('open'));
    await expect(page.locator('#battle-guidance-text')).toContainText('No enemy is in melee reach');
    await expect(page.locator('#party-container')).toContainText('Exposed');
    await expect(page.locator('#enemies-container')).toContainText('Needs move');

    await page.getByRole('button', { name: /attack/i }).click();
    await expect(page.locator('#battle-actions-container')).toContainText(/\d+ ft/);
    await expect(page.locator('#battle-actions-container')).toContainText('Needs move');
    await page.getByRole('button', { name: /back/i }).click();

    await page.evaluate(() => window.__setPlayerCombatState('spent'));
    await expect(page.locator('#battle-guidance-text')).toContainText('action is spent');
    await expect(page.locator('#battle-guidance-text')).toContainText('bonus action');
  });
});
