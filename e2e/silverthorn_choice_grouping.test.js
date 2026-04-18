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

test.describe('Silverthorn Choice Grouping', () => {
  test.setTimeout(60000);

  test('recommended first steps are separated from secondary hub options', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'SilverthornTester');
    await page.click('#btn-start-game');

    await (await advanceSceneUntilChoice(page, /enough ceremony/i)).click();
    await (await advanceSceneUntilChoice(page, /i hear the order/i)).click();
    await (await advanceSceneUntilChoice(page, /step back into silverthorn/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    await expect(page.locator('#choice-page-label')).toContainText(/likely leads/i);
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(3);
    await expect(page.locator('#choice-container')).toContainText('Step inside The Rusty Blade');
    await expect(page.locator('#choice-container')).toContainText('Take the temple road');
    await expect(page.locator('#choice-container')).toContainText('Make for the eastern gate');
    await expect(page.locator('#choice-container')).not.toContainText('Seek supplies at the General Store');
    await expect(page.locator('#choice-pagination')).toContainText('More Options');

    await expect(page.locator('#objective-helper')).toBeVisible();
    await page.click('#objective-helper-dismiss');
    await expect(page.locator('#objective-helper')).toBeHidden();

    await page.getByRole('button', { name: /more options/i }).click();
    await expect(page.locator('#choice-page-label')).toContainText(/other threads/i);
    await expect(page.locator('#choice-container')).toContainText("Present yourself at Alderic's chamber again");
    await expect(page.locator('#choice-container')).toContainText('Cross into the market quarter');
    await expect(page.locator('#choice-container')).toContainText('Read what fear has posted');

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

    await (await advanceSceneUntilChoice(page, /enough ceremony/i)).click();
    await (await advanceSceneUntilChoice(page, /i hear the order/i)).click();
    await (await advanceSceneUntilChoice(page, /step back into silverthorn/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    const rustyBladeChoice = page.getByRole('button', { name: 'Step inside The Rusty Blade' });
    await expect(rustyBladeChoice).toHaveAccessibleName('Step inside The Rusty Blade');
    await expect(rustyBladeChoice).toBeVisible();

    await expect(page.locator('#objective-strip')).toBeInViewport();
    await expect(page.locator('#choice-page-label')).toContainText(/likely leads/i);
    await expect(page.locator('.choice-pill.recommended')).toHaveCount(2);
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(2);
    await expect(page.locator('#choice-pagination')).toContainText('More Options');
    await expect(page.getByRole('button', { name: 'Take the temple road' })).toBeVisible();
  });
});
