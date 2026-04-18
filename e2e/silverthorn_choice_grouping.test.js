import { test, expect } from '@playwright/test';

test.describe('Silverthorn Choice Grouping', () => {
  test.setTimeout(60000);

  test('recommended first steps are separated from secondary hub options', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'SilverthornTester');
    await page.click('#btn-start-game');

    await page.getByRole('button', { name: /enough ceremony/i }).click();
    await page.getByRole('button', { name: /i hear the order/i }).click();
    await page.getByRole('button', { name: /step back into silverthorn/i }).click();

    const groups = page.locator('.choice-group');
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toContainText('Likely Leads');
    await expect(groups.nth(0)).toContainText('Step inside The Rusty Blade');
    await expect(groups.nth(0)).toContainText('Take the temple road');
    await expect(groups.nth(0)).toContainText('Make for the eastern gate');
    await expect(groups.nth(1)).toContainText('Other Threads');
    await expect(groups.nth(1)).toContainText("Present yourself at Alderic's chamber again");
    await expect(groups.nth(1)).toContainText('Cross into the market quarter');
    await expect(groups.nth(1)).toContainText('Read what fear has posted');
    await expect(page.locator('#choice-container')).not.toContainText('Seek supplies at the General Store');

    await expect(page.locator('#objective-helper')).toBeVisible();
    await page.click('#objective-helper-dismiss');
    await expect(page.locator('#objective-helper')).toBeHidden();

    await page.evaluate(() => window.goToScene('SCENE_HUB_SILVERTHORN'));
    await expect(page.locator('#objective-helper')).toBeHidden();
  });

  test('choice buttons keep action-only accessible names and mobile still surfaces the current aim', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'SilverthornMobile');
    await page.click('#btn-start-game');

    await page.getByRole('button', { name: /enough ceremony/i }).click();
    await page.getByRole('button', { name: /i hear the order/i }).click();
    await page.getByRole('button', { name: /step back into silverthorn/i }).click();

    const rustyBladeChoice = page.getByRole('button', { name: 'Step inside The Rusty Blade' });
    await expect(rustyBladeChoice).toHaveAccessibleName('Step inside The Rusty Blade');
    await expect(rustyBladeChoice).toBeVisible();

    await expect(page.locator('#objective-strip')).toBeInViewport();
    await expect(page.locator('.choice-group-title').first()).toHaveText('Likely Leads');
    await expect(page.locator('.choice-pill.recommended')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Take the temple road' })).toBeVisible();
  });
});
