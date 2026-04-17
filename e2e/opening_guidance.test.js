import { test, expect } from '@playwright/test';

test.describe('Opening Guidance', () => {
  test.setTimeout(60000);

  test('Silverthorn opening surfaces a current aim and recommended first steps', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'GuidanceTester');
    await page.click('#btn-start-game');

    await page.getByRole('button', { name: /enough ceremony/i }).click();
    await page.getByRole('button', { name: /i hear the order/i }).click();
    await page.getByRole('button', { name: /step back into silverthorn/i }).click();

    await expect(page.locator('#objective-strip')).toBeVisible();
    await expect(page.locator('#objective-text')).toContainText('Prepare in Silverthorn');
    await expect(page.locator('#objective-text')).toContainText('Rusty Blade');
    await expect(page.locator('.choice-pill.recommended')).toHaveCount(2);
    await expect(page.locator('#choice-container')).toContainText('Step inside The Rusty Blade');
    await expect(page.locator('#choice-container')).toContainText('Take the temple road');

    await page.click('#btn-quests');
    await expect(page.locator('#quest-list')).toContainText('The Rusty Blade, the temple road, and the market quarter');
  });
});
