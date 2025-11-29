from playwright.sync_api import sync_playwright

def verify_entry_points():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Monitor console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

        # Navigate to the game
        page.goto("http://localhost:8000")

        # Wait for the Start Menu to be visible
        try:
            page.wait_for_selector("#start-menu", state="visible", timeout=5000)
            print("Start Menu is visible.")
        except Exception as e:
            print(f"Error waiting for Start Menu: {e}")

        # Check if Continue button is disabled (assuming no save)
        continue_btn = page.locator("#btn-start-continue")
        if continue_btn.is_disabled():
            print("Continue button is correctly disabled.")
        else:
            print("Continue button is enabled (unexpected if no save).")

        # Take a screenshot
        page.screenshot(path="verification/entry_point_check.png")
        print("Screenshot saved to verification/entry_point_check.png")

        browser.close()

if __name__ == "__main__":
    verify_entry_points()
