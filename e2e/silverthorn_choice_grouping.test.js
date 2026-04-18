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

  test('Silverthorn opening uses concise button labels with pager-only overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'SilverthornTester');
    await page.click('#btn-start-game');

    await (await advanceSceneUntilChoice(page, /press alderic/i)).click();
    await (await advanceSceneUntilChoice(page, /accept the charge/i)).click();
    await (await advanceSceneUntilChoice(page, /exit alderic's chamber/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    await expect(page.locator('#choice-page-label')).toHaveCount(0);
    await expect(page.locator('.choice-pill')).toHaveCount(0);
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Step Inside the Rusty Blade' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Temple of Dawn' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eastern Gate' })).toBeVisible();
    await expect(page.locator('#choice-container')).not.toContainText('A strong first read');
    await expect(page.locator('#choice-pagination')).toContainText('More');

    await page.getByRole('button', { name: /^more$/i }).click();
    await expect(page.getByRole('button', { name: "Alderic's Chamber" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Market District' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notice Board' })).toBeVisible();
  });

  test('choice buttons keep concise accessible names and mobile still pages choices cleanly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'SilverthornMobile');
    await page.click('#btn-start-game');

    await (await advanceSceneUntilChoice(page, /press alderic/i)).click();
    await (await advanceSceneUntilChoice(page, /accept the charge/i)).click();
    await (await advanceSceneUntilChoice(page, /exit alderic's chamber/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    const rustyBladeChoice = page.getByRole('button', { name: 'Step Inside the Rusty Blade' });
    await expect(rustyBladeChoice).toHaveAccessibleName('Step Inside the Rusty Blade');
    await expect(rustyBladeChoice).toBeVisible();

    await expect(page.locator('#objective-strip')).toHaveCount(0);
    await expect(page.locator('#choice-page-label')).toHaveCount(0);
    await expect(page.locator('.choice-pill')).toHaveCount(0);
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(2);
    await expect(page.locator('#choice-pagination')).toContainText('More');
    await expect(page.getByRole('button', { name: 'Temple of Dawn' })).toBeVisible();
  });
});
