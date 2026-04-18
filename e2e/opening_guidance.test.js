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

  test('Silverthorn opening surfaces a current aim and recommended first steps', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'GuidanceTester');
    await page.click('#btn-start-game');

    await (await advanceSceneUntilChoice(page, /enough ceremony/i)).click();
    await (await advanceSceneUntilChoice(page, /i hear the order/i)).click();
    await (await advanceSceneUntilChoice(page, /step back into silverthorn/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    await expect(page.locator('#objective-strip')).toBeVisible();
    await expect(page.locator('#objective-text')).toContainText('Prepare in Silverthorn');
    await expect(page.locator('#objective-text')).toContainText('Rusty Blade');
    await expect(page.locator('#objective-helper')).toBeVisible();
    await expect(page.locator('#choice-page-label')).toContainText(/likely leads/i);
    await expect(page.locator('.choice-pill.recommended')).toHaveCount(3);
    await expect(page.locator('#choice-container')).toContainText('Step inside The Rusty Blade');
    await expect(page.locator('#choice-container')).toContainText('Take the temple road');
    await expect(page.locator('#choice-container')).toContainText('Make for the eastern gate');
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(3);
    await expect(page.locator('#choice-pagination')).toContainText('More Options');
    const narrativeOverflow = await page.locator('#narrative-section').evaluate((node) => window.getComputedStyle(node).overflowY);
    expect(['hidden', 'clip']).toContain(narrativeOverflow);

    await page.getByRole('button', { name: /more options/i }).click();
    await expect(page.locator('#choice-page-label')).toContainText(/other threads/i);
    await expect(page.locator('#choice-container')).toContainText("Present yourself at Alderic's chamber again");

    await page.click('#btn-menu');
    await page.click('#btn-menu-quests');
    await expect(page.locator('#quest-list')).toContainText('Worth considering');
    await expect(page.locator('#quest-list')).toContainText('The Rusty Blade is a strong first stop');
  });
});
