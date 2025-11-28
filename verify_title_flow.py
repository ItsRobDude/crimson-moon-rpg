
import asyncio
from playwright.async_api import async_playwright

async def run():
    print("STARTING VERIFICATION (Overwritten)")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Navigate to the game
        await page.goto("http://localhost:8000")

        # 1. Verify Title Screen is visible
        print("Checking Title Screen visibility...")
        title_screen = page.locator("#title-screen")
        try:
            await title_screen.wait_for(state="visible", timeout=5000)
        except Exception as e:
            print(f"Timed out waiting for Title Screen: {e}")
            # Dump HTML to see what's there
            print(await page.content())
            await browser.close()
            return

        # Verify background image (computed style)
        bg_image = await title_screen.evaluate("el => window.getComputedStyle(el).backgroundImage")
        print(f"Title Screen Background: {bg_image}")
        if "alderics_chamber" not in bg_image:
            print("ERROR: Background image is not alderics_chamber!")
            exit(1)

        # 2. Verify Start Game Button
        btn_new_game = page.locator("#btn-new-game")
        await btn_new_game.wait_for(state="visible")

        # 3. Click Start New Game
        print("Clicking Start New Game...")
        await btn_new_game.click()

        # 4. Verify Character Creation Modal is visible
        print("Checking Character Creation Modal...")
        cc_modal = page.locator("#char-creation-modal")
        await cc_modal.wait_for(state="visible", timeout=2000)

        # Verify Title Screen is hidden
        await title_screen.wait_for(state="hidden")

        # 5. Complete Character Creation
        print("Completing Character Creation...")
        await page.fill("#cc-name", "Hero")
        await page.click("#btn-start-game") # Begin Journey

        # 6. Verify Game Container is visible
        print("Checking Game Container...")
        game_container = page.locator("#game-container")
        await game_container.wait_for(state="visible", timeout=2000)

        # Verify specific game elements
        await page.locator("#stats-bar").wait_for(state="visible")
        await page.locator("#narrative-section").wait_for(state="visible")

        print("SUCCESS: Title Screen -> Character Creation -> Game Loop verified.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
