
import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    print("STARTING VISUAL VERIFICATION (FINAL)")
    # Ensure verification dir exists
    os.makedirs("/home/jules/verification", exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 720})

        # Navigate to the game
        await page.goto("http://localhost:8000")

        # 1. Verify Title Screen is visible
        print("Checking Title Screen visibility...")
        title_screen = page.locator("#title-screen")
        try:
            await title_screen.wait_for(state="visible", timeout=5000)
        except Exception as e:
            print(f"FAILED: Title Screen not visible. {e}")
            await browser.close()
            return

        # Screenshot Title Screen
        await page.screenshot(path="/home/jules/verification/title_screen_final.png")
        print("Screenshot saved: title_screen_final.png")

        # 2. Click Start New Game
        print("Clicking Start New Game...")
        await page.click("#btn-new-game")

        # 3. Verify Character Creation Modal is visible
        print("Checking Character Creation Modal...")
        cc_modal = page.locator("#char-creation-modal")
        await cc_modal.wait_for(state="visible", timeout=2000)

        # Screenshot Character Creation
        await page.screenshot(path="/home/jules/verification/char_creation_final.png")
        print("Screenshot saved: char_creation_final.png")

        # 4. Finish creation
        await page.fill("#cc-name", "Hero")
        await page.click("#btn-start-game")

        # 5. Verify Game Container
        print("Checking Game Container...")
        game_container = page.locator("#game-container")
        await game_container.wait_for(state="visible", timeout=2000)
        print("SUCCESS: Game started.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
