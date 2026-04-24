import { test, expect } from '@playwright/test';

test.describe('Character Creation Quick Starts', () => {
  test.setTimeout(60000);

  const presets = [
    { name: /road-worn fighter/i, classId: 'fighter', raceId: 'human', backgroundId: 'soldier', summary: 'Survivability: high' },
    { name: /watchful cleric/i, classId: 'cleric', raceId: 'human', backgroundId: 'acolyte', summary: 'prayer, support' },
    { name: /streetwise rogue/i, classId: 'rogue', raceId: 'elf', backgroundId: 'criminal', summary: 'stealth, angles' },
    { name: /spellbound wizard/i, classId: 'wizard', raceId: 'elf', backgroundId: 'sage', summary: 'spell reach' }
  ];

  test('quick-start archetypes prefill a usable build and still allow edits', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.getByRole('button', { name: /road-worn fighter/i }).click();

    await expect(page.locator('#cc-class')).toHaveValue('fighter');
    await expect(page.locator('#cc-race')).toHaveValue('human');
    await expect(page.locator('#cc-background')).toHaveValue('soldier');
    await expect(page.locator('#cc-class-summary')).toContainText('Survivability: high');
    await expect(page.locator('#cc-abilities-container select[data-stat="STR"]')).toHaveValue('15');
    await expect(page.locator('#cc-abilities-container select[data-stat="INT"]')).toHaveValue('8');
    await expect(page.locator('#cc-advanced-panel')).toBeHidden();
    await page.click('#cc-advanced-toggle');
    await expect(page.locator('#cc-advanced-panel')).toBeVisible();

    await page.selectOption('#cc-background', 'acolyte');
    await expect(page.locator('#cc-background')).toHaveValue('acolyte');

    await page.fill('#cc-name', 'PresetHero');
    await page.click('#btn-start-game');

    await expect(page.locator('#char-name')).toHaveText('PresetHero');
    await expect(page.locator('#char-class')).toContainText('Fighter / Acolyte');
  });

  test('all quick-start cards advertise and apply coherent builds', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await expect(page.locator('#cc-preview-content')).toContainText('Starting HP');
    await expect(page.locator('#cc-preview-content')).toContainText('Best first-road use');

    for (const preset of presets) {
      await page.getByRole('button', { name: preset.name }).click();
      await expect(page.getByRole('button', { name: preset.name })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#cc-class')).toHaveValue(preset.classId);
      await expect(page.locator('#cc-race')).toHaveValue(preset.raceId);
      await expect(page.locator('#cc-background')).toHaveValue(preset.backgroundId);
      await expect(page.locator('#cc-class-summary')).toContainText(preset.summary);
      await expect(page.locator('#cc-selection-summary')).toContainText('ready for the road');
    }
  });

  test('mobile creation view keeps the guided path readable before sheet details', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');

    await expect(page.locator('#cc-quick-starts')).toBeVisible();
    await expect(page.getByRole('button', { name: /road-worn fighter/i })).toBeVisible();
    await expect(page.locator('#cc-name')).toBeVisible();
    await expect(page.locator('#btn-start-game')).toBeVisible();
    await expect(page.locator('#cc-advanced-panel')).toBeHidden();
    await expect(page.locator('#cc-preview-content')).toContainText('Best first-road use');
  });
});
