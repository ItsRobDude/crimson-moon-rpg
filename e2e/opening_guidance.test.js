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

test.describe('Opening Guidance', () => {
  test.setTimeout(60000);

  test('Silverthorn opening keeps the screen focused on prose and concise VN choices', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'GuidanceTester');
    await page.click('#btn-start-game');

    await (await advanceSceneUntilChoice(page, /press alderic/i)).click();
    await (await advanceSceneUntilChoice(page, /accept the charge/i)).click();
    await (await advanceSceneUntilChoice(page, /exit alderic's chamber/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    await expect(page.locator('#objective-strip')).toHaveCount(0);
    await expect(page.locator('#objective-helper')).toHaveCount(0);
    await expect(page.locator('#choice-page-label')).toHaveCount(0);
    await expect(page.locator('.choice-pill')).toHaveCount(0);
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Step Inside the Rusty Blade' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Temple of Dawn' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eastern Gate' })).toBeVisible();
    await expect(page.locator('#choice-container')).not.toContainText('A strong first read');
    await expect(page.locator('#choice-pagination')).toContainText('More');
    const narrativeOverflow = await page.locator('#narrative-section').evaluate((node) => window.getComputedStyle(node).overflowY);
    expect(['hidden', 'clip']).toContain(narrativeOverflow);

    await page.getByRole('button', { name: /^more$/i }).click();
    await expect(page.getByRole('button', { name: "Alderic's Chamber" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Market District' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notice Board' })).toBeVisible();

    await page.click('#btn-menu');
    await page.click('#btn-menu-quests');
    await expect(page.locator('#quest-list')).toContainText('Worth considering');
    await expect(page.locator('#quest-list')).toContainText('The Rusty Blade is a strong first stop');
  });
});
