import { test, expect } from '@playwright/test';

async function advanceSceneUntilChoice(page, choiceName) {
  for (let attempts = 0; attempts < 12; attempts += 1) {
    const choice = page.getByRole('button', { name: choiceName });
    if (await choice.isVisible().catch(() => false)) {
      return choice;
    }

    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
      continue;
    }

    const moreButton = page.getByRole('button', { name: /more/i });
    if (await moreButton.isVisible().catch(() => false)) {
      await moreButton.click();
      continue;
    }

    break;
  }

  return page.getByRole('button', { name: choiceName });
}

async function clickChoice(page, choiceName) {
  const choice = await advanceSceneUntilChoice(page, choiceName);
  await expect(choice).toBeVisible();
  await choice.click();
}

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

  test('assembled companions surface contextual flavor and hostile gate choices carry immediate fallout', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'GateSmoke');
    await page.click('#btn-start-game');
    await page.waitForSelector('#char-name');

    await page.evaluate(async () => {
      const gameStateModule = await import('/data/gameState.js');
      window.gameState.flags.silverthorn_lark_recruited = true;
      window.gameState.flags.silverthorn_kieran_recruited = true;
      gameStateModule.addCompanion('lark');
      gameStateModule.addCompanion('kieran_brogan');
      window.goToScene('SCENE_SILVERTHORN_GATES');
    });

    await expect(await advanceSceneUntilChoice(page, 'Ask Lark')).toBeVisible();
    await expect(await advanceSceneUntilChoice(page, 'Ask Kieran')).toBeVisible();

    const sceneParagraph = page.locator('#narrative-text');

    await clickChoice(page, 'Ask Kieran');
    await expect(sceneParagraph).toContainText('Better a cursed road than another honest day helping bastards count bread');

    await clickChoice(page, 'Back to the Gate Plaza');
    await clickChoice(page, /Gate Captain/i);
    await clickChoice(page, 'Threaten the Captain');

    await expect(sceneParagraph).toContainText('The captain does not rise to the bait with a speech');
    await expect(page.locator('#log-content')).toContainText('Lark peels away from the road-party');
    await expect(page.locator('#log-content')).toContainText('Kieran spits a prayer sharp enough to count as a curse, hesitates like he still wants to help');
    await expect.poll(async () => page.evaluate(() => ({
      hostile: !!window.gameState.flags.silverthorn_watch_hostile,
      party: [...window.gameState.party]
    }))).toEqual({ hostile: true, party: [] });
    await expect(await advanceSceneUntilChoice(page, 'Driven to the Road')).toBeVisible();

    await page.evaluate(() => window.goToScene('SCENE_HUB_SILVERTHORN'));
    await expect(sceneParagraph).toContainText('Silverthorn is no longer a place you get to pace through');
    await expect(await advanceSceneUntilChoice(page, 'Under Watch')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Step Inside the Rusty Blade' })).toHaveCount(0);
  });
});
