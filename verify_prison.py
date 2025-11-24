from playwright.sync_api import sync_playwright
import time

def verify_prison_route():
    print("Starting verification of Prison Route...")
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

        # Wait for Character Creation and Start Game (Default values)
        try:
            page.wait_for_selector("#char-creation-modal", state="visible", timeout=5000)
            # Select Skills
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

        # Navigate to Hushbriar Gates from Arrival
        # Choice 1: "Approach the gates calmly."
        print("Approaching gates...")
        page.click("button:has-text('Approach the gates calmly.')")
        time.sleep(1)

        # At Gates
        # Choice 2: "Slip past while they argue (Stealth)" (High DC to force fail or chance fail?
        # Actually, let's pick the option that likely leads to combat or fails.
        # The skill checks have random rolls.
        # To FORCE combat, I need to lose a check or pick a fight.
        # The scene `SCENE_HUSHBRIAR_GATES` choices:
        # 1. Persuasion (DC 10)
        # 2. Stealth (DC 14)
        # If I fail, I go to `SCENE_HUSHBRIAR_COMBAT_GUARDS`.
        # Let's try Stealth as Rogue or Fighter? Default stats might fail DC 14.
        # Or I can inject a cheat to force combat scene?

        # For verifying the prison ROUTE, I really want to be in `SCENE_HUSHBRIAR_COMBAT_GUARDS`.
        # And then lose.

        # Let's cheat by injecting JS to go to scene directly.
        print("Cheating: Jumping to SCENE_HUSHBRIAR_COMBAT_GUARDS...")
        page.evaluate("window.gameState.player.hp = 1;") # Set HP low to die fast
        page.evaluate("import('./game.js').then(m => { console.log('Manually going to scene'); })")
        # Can't easily import module in console context unless exposed.
        # But I can try clicking through if I get lucky, or just modifying HP and waiting for enemy turn.

        # Attempt Stealth
        page.click("button:has-text('Slip past')")
        time.sleep(1)

        # Check where we are.
        text = page.locator("#narrative-text").inner_text()
        print(f"Scene Text: {text}")

        if "Traitors! Seize them!" in text:
            print("Entered Combat with Guards.")
            # Now die.
            # Player HP is 10/10. Enemy does damage.
            # I need to skip turns or just let enemy hit me.
            # Player Turn -> Flee (Failed flee leads to end turn? No, flee escape leads to loseScene!)
            # Wait, `performFlee` -> "Failed to escape!" -> `endPlayerTurn`.
            # If I flee successfully, `winScene`? No:
            # `if (total >= dc) { ... goToScene(gameState.combat.loseSceneId); }`
            # So FLEEING successfully goes to loseScene!
            # Perfect. `loseScene` is `SCENE_PRISON_CAPTURE`.

            print("Attempting to Flee (to trigger loseScene/Prison)...")
            # Flee DC is 12.
            # We need to keep trying until we succeed or die.

            max_tries = 10
            for i in range(max_tries):
                if page.is_visible("button:has-text('Flee')"):
                    page.click("button:has-text('Flee')")
                    time.sleep(1)
                    text = page.locator("#narrative-text").inner_text()
                    if "overwhelmed by the guards" in text:
                        print("SUCCESS: Reached SCENE_PRISON_CAPTURE")
                        break
                    else:
                        print("Flee failed or still in combat. Trying again...")
                else:
                    # Enemy turn might be processing
                    time.sleep(1)

        elif "Inside, the town is quiet" in text:
            print("Stealth Succeeded? Skipped combat.")
            # Well, that's valid game logic but failed verification of prison.
            # We can't easily force failure without mocks.
            pass

        browser.close()

if __name__ == "__main__":
    verify_prison_route()
