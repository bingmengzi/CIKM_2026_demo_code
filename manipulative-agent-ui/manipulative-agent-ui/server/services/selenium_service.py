"""Selenium verification service."""

import asyncio
import tempfile
import os
from typing import Optional
from server.config import SELENIUM_CONFIG_PATH


def _read_selenium_config() -> tuple[str, str]:
    """Read Chrome and Chromedriver paths from config."""
    with open(SELENIUM_CONFIG_PATH) as f:
        lines = f.read().strip().split("\n")

    # Support both plain-path format and KEY=VALUE format
    chrome_path = ""
    chromedriver_path = ""
    for line in lines:
        line = line.strip()
        if "=" in line:
            key, val = line.split("=", 1)
            key = key.strip().upper()
            val = val.strip()
            if key in ("CHROME_BINARY", "CHROME_PATH"):
                chrome_path = val
            elif key in ("CHROMEDRIVER_BINARY", "CHROMEDRIVER_PATH"):
                chromedriver_path = val
        elif not chrome_path:
            chrome_path = line
        elif not chromedriver_path:
            chromedriver_path = line

    print(f"[selenium_service] config: chrome={chrome_path}, chromedriver={chromedriver_path}")
    return chrome_path, chromedriver_path


def create_headless_driver():
    """Create a headless Chrome webdriver."""
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options

    chrome_path, chromedriver_path = _read_selenium_config()

    options = Options()
    options.binary_location = chrome_path
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    service = Service(executable_path=chromedriver_path)
    return webdriver.Chrome(service=service, options=options)


def capture_activity_screenshot(url: str, activity_id: int, output_dir: str) -> tuple[str, list]:
    """
    Navigate to a URL, switch to an activity, take screenshot, collect console logs.

    Returns: (screenshot_path, console_logs)
    """
    import time

    print(f"[selenium_service] capture_activity_screenshot: url={url}, activity_id={activity_id}")
    driver = create_headless_driver()
    print(f"[selenium_service] driver created successfully")
    try:
        driver.get(url)
        time.sleep(3)

        # Navigate to activity
        driver.execute_script(f"if(window.ActivityManager) ActivityManager.show({activity_id});")
        time.sleep(2)

        # Take screenshot
        screenshot_path = os.path.join(output_dir, f"activity_{activity_id}.png")
        driver.save_screenshot(screenshot_path)

        # Collect console logs
        logs = driver.get_log("browser")
        console_logs = [
            {"level": log["level"], "message": log["message"]}
            for log in logs
        ]

        return screenshot_path, console_logs
    finally:
        driver.quit()


def quick_rule_check(console_logs: list) -> dict:
    """Check console logs for critical JS errors."""
    critical_patterns = ["SyntaxError", "ReferenceError", "TypeError", "Uncaught"]
    issues = []

    for log in console_logs:
        if log["level"] in ("SEVERE", "ERROR"):
            msg = log["message"]
            for pattern in critical_patterns:
                if pattern in msg:
                    issues.append(msg)
                    break

    return {
        "has_critical_error": len(issues) > 0,
        "issues": issues,
    }


async def capture_activity_screenshot_async(url: str, activity_id: int, output_dir: str) -> tuple[str, list]:
    """Async wrapper."""
    return await asyncio.to_thread(capture_activity_screenshot, url, activity_id, output_dir)
