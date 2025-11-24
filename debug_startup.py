from playwright.sync_api import sync_playwright
import time

def debug_startup():
    print("Starting debug...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        try:
            print("Navigating to http://localhost:8080")
            page.goto("http://localhost:8080")
            time.sleep(2)

            if page.locator("#char-creation-modal").is_visible():
                print("Modal Visible")
            else:
                print("Modal Hidden or Not Found")
                # Check class list
                classes = page.locator("#char-creation-modal").get_attribute("class")
                print(f"Modal classes: {classes}")

        except Exception as e:
            print(f"Error: {e}")

        browser.close()

if __name__ == "__main__":
    debug_startup()
