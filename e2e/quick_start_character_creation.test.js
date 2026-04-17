import { test, expect } from '@playwright/test';

test.describe('Character Creation Quick Starts', () => {
  test.setTimeout(60000);

  test('quick-start archetypes prefill a usable build and still allow edits', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.getByRole('button', { name: /steady fighter/i }).click();

    await expect(page.locator('#cc-class')).toHaveValue('fighter');
    await expect(page.locator('#cc-race')).toHaveValue('human');
    await expect(page.locator('#cc-background')).toHaveValue('soldier');
    await expect(page.locator('#cc-class-summary')).toContainText('Survivability: high');
    await expect(page.locator('#cc-abilities-container select[data-stat="STR"]')).toHaveValue('15');
    await expect(page.locator('#cc-abilities-container select[data-stat="INT"]')).toHaveValue('8');

    await page.selectOption('#cc-background', 'acolyte');
    await expect(page.locator('#cc-background')).toHaveValue('acolyte');

    await page.fill('#cc-name', 'PresetHero');
    await page.click('#btn-start-game');

    await expect(page.locator('#char-name')).toHaveText('PresetHero');
    await expect(page.locator('#char-class')).toContainText('Fighter / Acolyte');
  });
});
