import { test, expect } from '@playwright/test';

async function advanceSceneUntilChoice(page, choiceName) {
  for (let attempts = 0; attempts < 12; attempts += 1) {
    const choice = page.getByRole('button', { name: choiceName });
    if (await choice.isVisible().catch(() => false)) {
      return choice;
    }

    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
      continue;
    }

    const visibleChoices = page.locator('#choice-container .choice-button:visible');
    if (await visibleChoices.count() === 1) {
      await visibleChoices.first().click();
      continue;
    }

    const moreButton = page.getByRole('button', { name: /more/i });
    if (await moreButton.isVisible().catch(() => false)) {
      await moreButton.click();
      continue;
    }

    break;
  }

  return page.getByRole('button', { name: choiceName });
}

async function clickChoice(page, choiceName) {
  const choice = await advanceSceneUntilChoice(page, choiceName);
  await expect(choice).toBeVisible();
  await choice.click();
}

test.describe('Canonical Spine Route', () => {
  test.setTimeout(120000);

  test('the live canonical route now runs from briefing to the processing cliff without scene jumps', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.99;
    });

    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'CanonRoute');
    await page.click('#btn-start-game');

    await clickChoice(page, /press alderic/i);
    await clickChoice(page, /accept the charge/i);
    await clickChoice(page, /exit alderic's chamber/i);
    await clickChoice(page, /eastern gate/i);
    await clickChoice(page, /find lark/i);
    await clickChoice(page, /bring lark/i);
    await clickChoice(page, /find kieran/i);
    await clickChoice(page, /bring kieran/i);
    await clickChoice(page, /shadowmire/i);
    await clickChoice(page, /take the eastern road/i);
    await clickChoice(page, /watch the treetops/i);
    await clickChoice(page, /fight for one breath/i);
    await clickChoice(page, /reach the coughing stranger/i);
    await clickChoice(page, /steady yourself/i);
    await clickChoice(page, /search for survivors/i);
    await clickChoice(page, /calm him/i);
    await clickChoice(page, /ask about the cathedral/i);
    await clickChoice(page, /tell him to keep low/i);
    await clickChoice(page, /overseer's row/i);
    await clickChoice(page, /inspect the door/i);
    await clickChoice(page, /study the runes/i);
    await clickChoice(page, /break wolf and serpent/i);
    await clickChoice(page, /read the journal/i);
    await clickChoice(page, /back to the study/i);
    await clickChoice(page, /back to the street/i);

    await page.click('#btn-menu');
    await page.click('#btn-menu-map');
    await expect(page.locator('#map-locations')).toContainText('Durnhelm');
    await page.keyboard.press('Escape');
    await expect(page.locator('#map-modal')).toBeHidden();

    await clickChoice(page, /take the durnhelm lead/i);
    await clickChoice(page, /push through the gatehouse/i);
    await clickChoice(page, /head for the holy forge/i);
    await clickChoice(page, /follow the coughing/i);
    await clickChoice(page, /take the lament hill lead/i);
    await clickChoice(page, /look for the graves/i);
    await clickChoice(page, /return to the cottage/i);
    await clickChoice(page, /pull back the cloth/i);
    await clickChoice(page, /tell her you're unarmed/i);
    await clickChoice(page, /ask about the mark/i);

    await advanceSceneUntilChoice(page, /go to hushbriar/i);
    await expect(page.getByRole('button', { name: 'Go to Hushbriar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Seek the Archives' })).toBeVisible();
    await page.getByRole('button', { name: 'Seek the Archives' }).click();

    await clickChoice(page, /enter the cave/i);
    await clickChoice(page, /walk through the false dead/i);
    await clickChoice(page, /ask for aodhan's truth/i);
    await clickChoice(page, /ask for more truth/i);
    await clickChoice(page, /ask where aodhan goes/i);
    await clickChoice(page, /descend to hushbriar/i);
    await clickChoice(page, /approach the gates/i);
    await clickChoice(page, /ask for shelter/i);
    await clickChoice(page, /enter the briarwood inn/i);
    await clickChoice(page, /talk to fionnlagh/i);
    await clickChoice(page, /ask what he's hearing/i);
    await clickChoice(page, /run toward the lane/i);
    await clickChoice(page, /follow the drag-marks/i);
    await clickChoice(page, /approach the moonwell/i);
    await clickChoice(page, /confront aodhan/i);
    await clickChoice(page, /let him walk/i);
    await clickChoice(page, /go back into hushbriar/i);
    await clickChoice(page, /follow the smashed-door trail/i);
    await clickChoice(page, /read the ledger/i);
    await clickChoice(page, /follow the dock trail/i);
    await clickChoice(page, /offer the ledger/i);
    await clickChoice(page, /take me to her/i);
    await clickChoice(page, /ask about aodhan/i);
    await clickChoice(page, /keep her breathing/i);

    await advanceSceneUntilChoice(page, /carry the knowledge forward/i);
    await expect(page.locator('#narrative-text')).toContainText('The strong and healthy are being marched toward Silverthorn for processing');

    await page.click('#btn-menu');
    await page.click('#btn-menu-quests');
    await expect(page.locator('#quest-summary')).toContainText('Processing And The Next Dark');
    await expect(page.locator('#quest-list')).toContainText('Soul Mill');
    await page.keyboard.press('Escape');
    await expect(page.locator('#quest-modal')).toBeHidden();

    await clickChoice(page, /carry the knowledge forward/i);
    await expect(page.locator('#start-menu')).toBeVisible();
    await expect(page.locator('#start-menu')).toContainText('Start');
  });

  test('the Sporefall linger route can launch the Dreadcap fight after Eoin info plus a handling choice', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.99;
    });

    await page.goto('/');
    await page.waitForFunction(() => window.gameReady);

    await page.click('#btn-start-new');
    await page.fill('#cc-name', 'DreadcapRoute');
    await page.click('#btn-start-game');

    await clickChoice(page, /press alderic/i);
    await clickChoice(page, /accept the charge/i);
    await clickChoice(page, /exit alderic's chamber/i);
    await clickChoice(page, /eastern gate/i);
    await clickChoice(page, /find lark/i);
    await clickChoice(page, /bring lark/i);
    await clickChoice(page, /find kieran/i);
    await clickChoice(page, /bring kieran/i);
    await clickChoice(page, /shadowmire/i);
    await clickChoice(page, /take the eastern road/i);
    await clickChoice(page, /watch the treetops/i);
    await clickChoice(page, /fight for one breath/i);
    await clickChoice(page, /reach the coughing stranger/i);
    await clickChoice(page, /steady yourself/i);
    await clickChoice(page, /search for survivors/i);
    await clickChoice(page, /calm him/i);
    await clickChoice(page, /ask about the cathedral/i);
    await clickChoice(page, /tell him to keep low/i);
    await clickChoice(page, /check on eoin/i);
    await clickChoice(page, /linger too long/i);
    await clickChoice(page, /face the dreadcap/i);

    await expect(page.locator('#battle-screen')).not.toHaveClass(/hidden/);
    await expect(page.getByText(/A Dreadcap Colossus heaves into view/i)).toBeVisible();
  });
});
