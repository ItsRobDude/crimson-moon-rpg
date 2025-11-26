// __tests__/character_creation.test.js
import { test, expect } from '@playwright/test';

test.describe('Character Creation UI', () => {
  // Increase the default timeout for this test suite
  test.setTimeout(60000);

  test('should update character name in the UI after creation', async ({ page }) => {
    // Listen for all console events and log them to the test output
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Log all network requests to diagnose 404 errors
    page.on('request', request => console.log('>>', request.method(), request.url()));
    page.on('response', response => console.log('<<', response.status(), response.url()));

    // Navigate to the local development server
    await page.goto('http://localhost:8000');

    // Wait for the game to be ready
    await page.waitForFunction(() => window.gameReady);

    // Define the character name
    const characterName = 'Jules';

    // Fill in the character name
    await page.fill('#cc-name', characterName);

    // Click the "Start Game" button
    await page.click('#btn-start-game');

    // Wait for the character name to be updated in the UI
    const characterNameElement = await page.waitForSelector('#char-name');

    // Get the text content of the element
    const displayedName = await characterNameElement.textContent();

    // Assert that the displayed name matches the entered name
    expect(displayedName).toBe(characterName);
  });
});
