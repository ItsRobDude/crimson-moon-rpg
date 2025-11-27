from playwright.sync_api import sync_playwright

def verify_combat_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the game
        page.goto('http://localhost:8000')
        page.wait_for_function('window.gameReady === true')

        # Create Character
        page.select_option('#cc-class', 'wizard')
        page.fill('#cc-name', 'Gandalf')
        page.click('#btn-start-game')
        page.wait_for_selector('#char-name')

        # Trigger Combat manually
        page.evaluate("window.startCombat(['fungal_beast'], 'SCENE_BRIEFING', 'SCENE_DEFEAT')")
        page.wait_for_selector('#battle-screen:not(.hidden)')

        # Wait for enemy card
        page.wait_for_selector('.enemy-card')

        # Take screenshot of initial combat state
        page.screenshot(path='verification/combat_start.png')
        print("Screenshot combat_start.png saved.")

        # Check if Player Turn, if not wait
        turn_text = page.locator('#turn-indicator').text_content()
        if "Enemy" in turn_text:
             page.wait_for_function("document.getElementById('turn-indicator').textContent.includes(\"Gandalf's Turn\")", timeout=10000)

        # Perform Attack
        page.click('button:has-text("Attack")')
        page.wait_for_timeout(500)
        page.click('button:has-text("Fungal Beast")')

        # Wait for log update
        page.wait_for_function("document.getElementById('battle-log-content').innerText.includes('attacks')")

        # Take screenshot of attack result
        page.screenshot(path='verification/combat_attack.png')
        print("Screenshot combat_attack.png saved.")

        browser.close()

if __name__ == "__main__":
    verify_combat_ui()
