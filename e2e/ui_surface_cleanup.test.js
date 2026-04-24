import { test, expect } from '@playwright/test';

async function advanceSceneUntilChoice(page, choiceName) {
  for (let attempts = 0; attempts < 8; attempts += 1) {
    const choice = page.getByRole('button', { name: choiceName });
    if (await choice.isVisible().catch(() => false)) {
      return choice;
    }

    const continueButton = page.getByRole('button', { name: /^continue$/i });
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
      continue;
    }

    break;
  }

  return page.getByRole('button', { name: choiceName });
}

async function reachSilverthorn(page, characterName = 'SurfaceTester') {
  await page.goto('/');
  await page.waitForFunction(() => window.gameReady);

  await page.click('#btn-start-new');
  await page.fill('#cc-name', characterName);
  await page.click('#btn-start-game');

  await (await advanceSceneUntilChoice(page, /press alderic/i)).click();
  await (await advanceSceneUntilChoice(page, /accept the charge/i)).click();
  await (await advanceSceneUntilChoice(page, /exit alderic's chamber/i)).click();
  await advanceSceneUntilChoice(page, /step inside the rusty blade/i);
}

test.describe('UI Surface Cleanup', () => {
  test.setTimeout(60000);

  test('menu, help, options, quests, map, and codex open with clearer purpose cues', async ({ page }) => {
    await reachSilverthorn(page, 'UtilityTester');

    await page.click('#btn-menu');
    await expect(page.locator('#menu-modal')).toBeVisible();
    await expect(page.locator('#menu-modal .modal-subtitle')).toContainText('save management');

    await page.click('#btn-tutorial');
    await expect(page.locator('#tutorial-overlay')).toBeVisible();
    await expect(page.locator('#tutorial-overlay')).toContainText('Field Notes');
    await expect(page.locator('#tutorial-overlay')).toContainText('Saving And Partial Systems');
    await page.keyboard.press('Escape');
    await expect(page.locator('#tutorial-overlay')).toBeHidden();

    await page.click('#btn-options');
    await expect(page.locator('#options-modal')).toBeVisible();
    await page.selectOption('#opt-text-size', 'large');
    await page.click('#btn-options-apply');
    await expect(page.locator('#options-status')).toHaveText('Options updated.');
    await page.keyboard.press('Escape');
    await expect(page.locator('#options-modal')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-modal')).toBeHidden();

    await page.click('#btn-menu');
    await page.click('#btn-menu-quests');
    await expect(page.locator('#quest-modal')).toBeVisible();
    await expect(page.locator('#quest-summary')).toContainText('Current Thread');
    await expect(page.locator('#quest-list')).toContainText('Thread');
    await expect(page.locator('#quest-list')).toContainText('Known Lead');
    await expect(page.locator('#quest-list')).toContainText('Unease');
    await expect(page.locator('#quest-list')).toContainText('Silverthorn still has rumor, prayer, supplies');
    await expect(page.locator('#quest-list')).not.toContainText('What You Have To Go On');
    await page.keyboard.press('Escape');
    await expect(page.locator('#quest-modal')).toBeHidden();

    await page.click('#btn-menu');
    await page.click('#btn-menu-map');
    await expect(page.locator('#map-modal')).toBeVisible();
    await expect(page.locator('#map-summary')).toContainText('currently stand in Silverthorn');
    await expect(page.locator('#map-summary')).toContainText('not directions');
    await expect(page.locator('#map-locations')).toContainText('You are here');
    await expect(page.locator('#map-locations')).not.toContainText('Soul Mill');
    await page.fill('#pin-note', 'Watch the eastern gate at dusk');
    await page.click('#btn-add-pin');
    await expect(page.locator('#pin-list')).toContainText('Watch the eastern gate at dusk');
    await page.keyboard.press('Escape');
    await expect(page.locator('#map-modal')).toBeHidden();

    await page.click('#btn-menu');
    await page.click('#btn-menu-codex');
    await expect(page.locator('#codex-modal')).toBeVisible();
    await expect(page.locator('#codex-list')).toContainText('Alderic');
    await page.click('#btn-codex-factions');
    await expect(page.locator('#codex-list')).toContainText('Silverthorn');
    await page.keyboard.press('Escape');
    await expect(page.locator('#codex-modal')).toBeHidden();

    await page.click('#btn-menu');
    await page.click('#btn-menu-log');
    await expect(page.locator('#log-modal')).toBeVisible();
    await expect(page.locator('#log-modal-content')).toContainText('Story Thread Advanced');
  });

  test('shop and inventory surfaces explain tradeoffs, buying limits, and item actions', async ({ page }) => {
    await reachSilverthorn(page, 'Quartermaster');

    await page.evaluate(() => {
      window.gameState.player.gold = 10;
      window.goToScene('SCENE_SILVERTHORN_BLACKSMITH');
    });
    await expect(page.locator('#shop-panel')).toBeVisible();
    await expect(page.locator('#shop-subtitle')).toContainText('not buying second-hand gear back');
    await expect(page.locator('#shop-status')).toContainText('compare against your current loadout');
    await expect(page.locator('#shop-status')).toContainText('items on offer');
    await expect(page.locator('#shop-items-container')).toContainText('Club');
    await expect(page.locator('#shop-items-container')).toContainText('Weapon');
    expect(await page.locator('#shop-items-container button:disabled').count()).toBeGreaterThan(0);

    let clubRow = page.locator('#shop-items-container .shop-entry', { hasText: 'Club' });
    await clubRow.getByRole('button', { name: /buy for 1g/i }).click();
    clubRow = page.locator('#shop-items-container .shop-entry', { hasText: 'Club' });
    await expect(clubRow).toContainText('Owned x1');
    await expect(page.locator('#shop-gold-display')).toContainText('Party Gold: 9');

    await page.evaluate(async () => {
      const gameStateModule = await import('/data/gameState.js');
      gameStateModule.addItem('shield');
      gameStateModule.addItem('potion_healing');
      window.gameState.player.hp = Math.max(1, window.gameState.player.hp - 4);
    });

    await page.click('#shop-panel .close-modal');
    await expect(page.locator('#shop-panel')).toBeHidden();
    await page.click('#btn-menu');
    await page.click('#btn-menu-inventory');
    await expect(page.locator('#inventory-modal')).toBeVisible();
    await expect(page.locator('#inventory-summary')).toContainText("Viewing Quartermaster's kit");

    const shieldEntry = page
      .locator('.inventory-entry')
      .filter({ has: page.locator('strong', { hasText: /^Shield$/ }) })
      .first();
    await shieldEntry.click();
    await expect(page.locator('#inventory-detail')).toContainText('Equip or unequip it from this window');
    await shieldEntry.locator('button').first().click();
    await expect(page.locator('#inventory-equipment-panel')).toContainText('Shield');

    const hpBefore = await page.locator('#hp-text').textContent();
    const potionEntry = page
      .locator('.inventory-entry')
      .filter({ has: page.locator('strong', { hasText: /^Potion of Healing$/ }) })
      .first();
    await potionEntry.click();
    await expect(page.locator('#inventory-detail')).toContainText('Can be used directly from this window');
    await potionEntry.locator('button').first().click();
    await expect(page.locator('#hp-text')).not.toHaveText(hpBefore || '');
  });

  test('rest and level-up modals are explicit about risk and partial implementation', async ({ page }) => {
    await reachSilverthorn(page, 'LevelTester');

    await page.getByRole('button', { name: /step inside the rusty blade/i }).click();
    await (await advanceSceneUntilChoice(page, /take a room/i)).click();
    await expect(page.locator('#rest-modal')).toBeVisible();
    await expect(page.locator('#rest-modal .modal-subtitle')).toContainText('Rest trades time for recovery');
    await expect(page.locator('#btn-short-rest')).toHaveText('Begin Short Rest');
    await expect(page.locator('#btn-long-rest')).toHaveText('Begin Long Rest');
    await page.click('#rest-modal .close-modal');
    await expect(page.locator('#rest-modal')).toBeHidden();

    await page.evaluate(() => {
      window.gameState.player.level = 3;
      window.gameState.pendingLevelUp = true;
    });
    await page.click('#char-level');
    await expect(page.locator('#level-up-modal')).toBeVisible();
    await expect(page.locator('#lu-advancement-mode')).toHaveValue('asi');
    await expect(page.locator('#lu-feat-select')).toContainText('Alert');
    await expect(page.locator('#lu-feat-select')).toContainText('Mobile');
    await expect(page.locator('#lu-feat-select')).toContainText('Resilient');
    await expect(page.locator('#lu-feat-select')).toContainText('Tough');
    await expect(page.locator('#lu-feat-note')).toContainText('Choose one ability for +2 or two abilities for +1 each.');
    await page.selectOption('#lu-advancement-mode', 'feat');
    await page.selectOption('#lu-feat-select', 'alert');
    await expect(page.locator('#lu-feat-note')).toContainText('Gain a +5 bonus to initiative rolls.');
    await expect(page.locator('#btn-confirm-level-up')).toHaveText('Confirm Level Up');
  });
});
