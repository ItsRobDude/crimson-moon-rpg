import { test, expect } from '@playwright/test';

test.describe('HUD Staging', () => {
  test.setTimeout(60000);

  test('opening HUD reveals only the tools that matter right now', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'HudTester');
    await page.click('#btn-start-game');

    await expect(page.locator('#btn-inventory')).toBeVisible();
    await expect(page.locator('#btn-quests')).toBeVisible();
    await expect(page.locator('#btn-menu')).toBeVisible();
    await expect(page.locator('#btn-map')).toBeHidden();
    await expect(page.locator('#btn-codex')).toBeHidden();

    await page.getByRole('button', { name: /enough ceremony/i }).click();
    await page.getByRole('button', { name: /i hear the order/i }).click();
    await page.getByRole('button', { name: /step back into silverthorn/i }).click();

    await expect(page.locator('#btn-map')).toBeVisible();
    await expect(page.locator('#btn-codex')).toBeVisible();

    await page.evaluate(() => window.goToScene('SCENE_TRAVEL_SHADOWMIRE'));
    await expect(page.locator('#btn-map')).toBeVisible();
    await expect(page.locator('#btn-codex')).toBeVisible();
  });
});
