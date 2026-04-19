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

test.describe('Canonical VN Surface', () => {
  test.setTimeout(60000);

  test('critical-path scenes use concise VN labels from opening through late route beats', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'RouteLabelTester');
    await page.click('#btn-start-game');

    await (await advanceSceneUntilChoice(page, /press alderic/i)).click();
    await (await advanceSceneUntilChoice(page, /accept the charge/i)).click();
    await (await advanceSceneUntilChoice(page, /exit alderic's chamber/i)).click();
    await advanceSceneUntilChoice(page, /step inside the rusty blade/i);

    await expect(page.getByRole('button', { name: 'Step Inside the Rusty Blade' })).toBeVisible();
    await expect(page.locator('#choice-container .choice-button')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Temple of Dawn' })).toBeVisible();
    await page.getByRole('button', { name: /^more$/i }).click();
    await expect(page.getByRole('button', { name: 'Market District' })).toBeVisible();

    await page.evaluate(() => window.goToScene('SCENE_DURNHELM_ENTRY'));
    await advanceSceneUntilChoice(page, /search the gate quarter/i);
    await expect(page.getByRole('button', { name: 'Search the Gate Quarter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Head for the Holy Forge' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Take the Lament Hill Lead' })).toBeVisible();

    await page.evaluate(async () => {
      const stateModule = await import('/data/gameState.js');
      stateModule.addItem('stone_of_oblivion');
      window.goToScene('SCENE_ELARA_HIDEAWAY');
    });

    await advanceSceneUntilChoice(page, /show elara the stone/i);
    await expect(page.getByRole('button', { name: 'Show Elara the Stone' })).toBeVisible();
    await page.getByRole('button', { name: 'Show Elara the Stone' }).click();
    await advanceSceneUntilChoice(page, /make them name the cost/i);
    await expect(page.getByRole('button', { name: 'Make Them Name the Cost' })).toBeVisible();
  });
});
