import { test, expect } from '@playwright/test';

test.describe('Party Recruitment Smoke', () => {
  test.setTimeout(60000);

  test('seeded companion persists through save/load and appears in combat UI', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'PartySmoke');
    await page.click('#btn-start-game');
    await page.waitForSelector('#char-name');

    await page.evaluate(async () => {
      const gameStateModule = await import('/data/gameState.js');
      window.gameState.flags.silverthorn_lark_recruited = true;
      gameStateModule.addCompanion('lark');
      gameStateModule.saveGame();
    });

    await expect.poll(async () => page.evaluate(() => window.gameState.party.includes('lark'))).toBe(true);

    await page.evaluate(() => window.goToScene('SCENE_SPOREFALL_NORTH_AMBUSH'));
    await expect(page.locator('#battle-screen')).not.toHaveClass(/hidden/);
    await expect(page.locator('#party-container')).toContainText('Lark');

    await page.reload();
    await page.waitForFunction(() => window.gameReady);
    await page.click('#btn-start-continue');
    await page.waitForSelector('#char-name');

    await expect.poll(async () => page.evaluate(() => window.gameState.party.includes('lark'))).toBe(true);
    await page.evaluate(() => window.goToScene('SCENE_SPOREFALL_NORTH_AMBUSH'));
    await expect(page.locator('#party-container')).toContainText('Lark');
  });
});
