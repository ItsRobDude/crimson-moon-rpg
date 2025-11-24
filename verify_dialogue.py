from playwright.sync_api import sync_playwright
import time

def verify_dialogue_flow():
    print("Starting verification of dialogue flow...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

        try:
            print("Navigating to http://localhost:8080")
            page.goto("http://localhost:8080")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Start Game
        try:
            page.wait_for_selector("#char-creation-modal", state="visible", timeout=5000)
            checkboxes = page.locator("#cc-skills-container input[type='checkbox']")
            if checkboxes.count() >= 2:
                checkboxes.nth(0).check()
                checkboxes.nth(1).check()
            page.click("#btn-start-game")
            page.wait_for_selector("#char-creation-modal", state="hidden", timeout=5000)
        except Exception as e:
            print(f"Failed to start game: {e}")
            return

        time.sleep(1)

        # Navigate to Hushbriar Town
        # Arrival -> Gates -> Town
        print("Navigating to Town...")
        page.click("button:has-text('Approach the gates calmly.')")
        time.sleep(1)
        # Persuasion check (Might fail/succeed). If fail -> Combat. If succeed -> Town.
        # Let's try 'Slip past' (Stealth) or Persuasion.
        # If we end up in combat, we can't verify dialogue.
        # Let's use cheat to jump to town?
        # Or we can assume Persuasion DC 10 is easy enough with 15 CHA?
        # Let's try cheating to be safe.

        # Actually, we can verify Fionnlagh logic by just jumping to SCENE_BRIARWOOD_INN.
        # But we need to set Fionnlagh status to 'alive' (default) for the choice to appear.
        # The code sets default npcStates in init.

        print("Cheating: Jumping to SCENE_BRIARWOOD_INN...")
        # We can't easily inject JS to change scene without exposing goToScene.
        # But we can rely on the fact that we are at SCENE_ARRIVAL_HUSHBRIAR.
        # We can try to pick choices.

        # Persuasion option:
        if page.is_visible("button:has-text('Show respect')"):
             page.click("button:has-text('Show respect')")
             time.sleep(1)

        # Check if we are at Town or Combat
        text = page.locator("#narrative-text").inner_text()
        if "Inside, the town is quiet" in text:
            print("Reached Town.")
            page.click("button:has-text('Enter the Briarwood Inn')")
            time.sleep(1)

            text = page.locator("#narrative-text").inner_text()
            if "The inn is crowded" in text:
                print("Reached Inn.")
                # Check for Fionnlagh choice
                if page.is_visible("button:has-text('Talk to Fionnlagh')"):
                    print("SUCCESS: Fionnlagh option visible.")
                    page.click("button:has-text('Talk to Fionnlagh')")
                    time.sleep(1)
                    # Verify Hub
                    if page.is_visible("button:has-text('Ask about the plague')"):
                        print("SUCCESS: Reached Fionnlagh Hub.")
                        page.click("button:has-text('Ask about the plague')")
                        time.sleep(1)
                        # Verify Sub-dialogue and Back
                        if page.is_visible("button:has-text('Back')"):
                            print("SUCCESS: Info displayed, Back button visible.")
                            page.click("button:has-text('Back')")
                            time.sleep(1)
                            if page.is_visible("button:has-text('Ask about the clan')"):
                                print("SUCCESS: Returned to Hub.")
                            else:
                                print("FAILURE: Did not return to Hub.")
                        else:
                            print("FAILURE: Back button missing.")
                    else:
                        print("FAILURE: Hub options missing.")
                else:
                    print("FAILURE: Fionnlagh option missing (NPC state issue?).")
            else:
                print("Failed to reach Inn.")
        else:
            print("Failed to reach Town (Combat/Fail).")

        browser.close()

if __name__ == "__main__":
    verify_dialogue_flow()
