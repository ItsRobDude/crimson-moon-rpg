from playwright.sync_api import sync_playwright

def verify_new_game_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Monitor console logs and errors
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        # Navigate to the game
        page.goto("http://localhost:8000")

        # Wait for game to be ready
        try:
            page.wait_for_function("window.gameReady === true", timeout=5000)
            print("Game is ready.")
        except Exception as e:
            print(f"Error waiting for game ready: {e}")
            browser.close()
            return

        # 1. Clear LocalStorage to ensure fresh start
        page.evaluate("localStorage.clear()")
        page.reload() # Reload to apply clear
        page.wait_for_function("window.gameReady === true")

        # 2. Click "New Game"
        new_game_btn = page.locator("#btn-start-new")
        if new_game_btn.is_visible():
            new_game_btn.click()
            print("Clicked New Game.")
        else:
            print("New Game button not visible!")
            browser.close()
            return

        # 3. Fill Character Creation Form
        try:
            page.wait_for_selector("#char-creation-modal", state="visible", timeout=3000)
            print("Character Creation Modal visible.")

            # Set Name
            page.fill("#cc-name", "Phase2Tester")

            # Select Race (First option)
            page.select_option("#cc-race", index=0)

            # Select Class (First option)
            page.select_option("#cc-class", index=0)

            # Adjust Stats to be unique (Standard Array: 15, 14, 13, 12, 10, 8)
            stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
            values = ['15', '14', '13', '12', '10', '8']

            stat_rows = page.locator("#cc-abilities-container .stat-row")
            for i in range(6):
                select = stat_rows.nth(i).locator("select")
                select.select_option(values[i])

            print("Stats assigned.")

            # Click Begin Journey
            page.click("#btn-start-game")
            print("Clicked Begin Journey.")

        except Exception as e:
            print(f"Error during Character Creation: {e}")
            browser.close()
            return

        # 4. Verify HUD and Scene
        try:
            # Short wait for UI update
            page.wait_for_timeout(1000)

            # HUD Name
            char_name = page.locator("#char-name")
            if char_name.inner_text() == "Phase2Tester":
                print("HUD Name Verified: Phase2Tester")
            else:
                print(f"HUD Name Mismatch: Found '{char_name.inner_text()}'")

            # Scene ID Check
            scene_id = page.evaluate("window.gameState && window.gameState.currentSceneId")
            print(f"DEBUG: Current Scene ID is {scene_id}")

            if scene_id == "SCENE_BRIEFING":
                print(f"Scene Verified: {scene_id}")
            else:
                print(f"Scene Mismatch: Found '{scene_id}'")

            # Save File Check
            has_save = page.evaluate("!!localStorage.getItem('crimson_moon_save')")
            if has_save:
                print("Save file created successfully.")
            else:
                print("Error: No save file found in localStorage!")
                # Debug: print localStorage content?
                ls_content = page.evaluate("JSON.stringify(localStorage)")
                print(f"DEBUG: localStorage: {ls_content}")

        except Exception as e:
             print(f"Error during verification: {e}")

        # Take a screenshot
        page.screenshot(path="verification/verify_phase2_cc.png")
        print("Screenshot saved to verification/verify_phase2_cc.png")

        browser.close()

if __name__ == "__main__":
    verify_new_game_flow()
