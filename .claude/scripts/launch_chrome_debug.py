#!/usr/bin/env python3
"""launch_chrome_debug.py - Launch Chrome with remote debugging (Windows native).
Usage: python .claude/scripts/launch_chrome_debug.py
After launching, log in manually, then use cdp.py commands.
"""
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]
PROFILE_DIR = r"C:\Users\Mauri\chrome-debug-profile"
DEBUG_PORT = 9222
START_URL = "https://staging.neondash.com.br"


def find_chrome() -> str:
    for path in CHROME_PATHS:
        if Path(path).exists():
            return path
    return "chrome"  # fallback: assume chrome is in PATH


def main() -> None:
    print("Killing existing Chrome instances...")
    subprocess.run(
        ["taskkill", "/F", "/IM", "chrome.exe"],
        capture_output=True,
    )
    time.sleep(2)

    chrome = find_chrome()
    print(f"Launching Chrome: {chrome}")
    subprocess.Popen(
        [
            chrome,
            f"--remote-debugging-port={DEBUG_PORT}",
            "--remote-allow-origins=*",
            "--no-first-run",
            f"--user-data-dir={PROFILE_DIR}",
            START_URL,
        ],
        creationflags=subprocess.DETACHED_PROCESS if sys.platform == "win32" else 0,
    )
    time.sleep(5)

    print("Verifying CDP port...")
    try:
        urllib.request.urlopen(
            f"http://localhost:{DEBUG_PORT}/json/version", timeout=5
        )
        print(f"✓ Port {DEBUG_PORT} open — CDP ready")
    except Exception:
        print(f"✗ Port {DEBUG_PORT} not responding — check Chrome startup")
        sys.exit(1)

    print("")
    print("Chrome launched. Now:")
    print("  1. Complete any challenge + log in manually in the Chrome window")
    print("  2. Session persists in:", PROFILE_DIR)
    print("  3. Then use: python .claude/scripts/cdp.py navigate/screenshot/analyze")
    print("  4. OR use Playwright MCP tools directly (mcp__playwright__browser_*)")


if __name__ == "__main__":
    main()
