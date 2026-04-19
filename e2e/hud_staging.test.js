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

test.describe('HUD Staging', () => {
  test.setTimeout(60000);

  test('opening HUD reveals only the tools that matter right now', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'HudTester');
    await page.click('#btn-start-game');

    await expect(page.locator('#btn-menu')).toBeVisible();
    await expect(page.locator('#char-loadout')).toBeHidden();
    await expect(page.locator('#btn-inventory')).toBeHidden();
    await expect(page.locator('#btn-quests')).toBeHidden();
    await expect(page.locator('#btn-map')).toBeHidden();
    await expect(page.locator('#btn-codex')).toBeHidden();

    await page.click('#btn-menu');
    await expect(page.locator('#btn-menu-inventory')).toBeVisible();
    await expect(page.locator('#btn-menu-quests')).toBeVisible();
    await expect(page.locator('#btn-menu-map')).toBeHidden();
    await expect(page.locator('#btn-menu-codex')).toBeHidden();
    await page.keyboard.press('Escape');

    await (await advanceSceneUntilChoice(page, /press alderic/i)).click();
    await (await advanceSceneUntilChoice(page, /accept the charge/i)).click();
    await (await advanceSceneUntilChoice(page, /exit alderic's chamber/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    await expect(page.locator('#btn-map')).toBeHidden();
    await expect(page.locator('#btn-codex')).toBeHidden();
    await page.click('#btn-menu');
    await expect(page.locator('#btn-menu-map')).toBeVisible();
    await expect(page.locator('#btn-menu-codex')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.evaluate(() => window.goToScene('SCENE_TRAVEL_SHADOWMIRE'));
    await page.click('#btn-menu');
    await expect(page.locator('#btn-menu-map')).toBeVisible();
    await expect(page.locator('#btn-menu-codex')).toBeVisible();
  });

  test('mobile narrative HUD yields more space to the scene than the old dashboard shell', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'MobileHud');
    await page.click('#btn-start-game');

    await expect(page.locator('#char-loadout')).toBeHidden();
    await expect(page.locator('#xp-bar-fill')).toBeHidden();
    await expect(page.locator('#btn-menu')).toBeVisible();
  });
});
