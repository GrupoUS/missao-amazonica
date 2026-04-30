#!/usr/bin/env python3
"""chrome_screenshot.py - Take screenshot of a page in Windows Chrome (CDP on port 9222).
Usage: python3 chrome_screenshot.py <output-path>
Requires: Chrome running with --remote-debugging-port=9222
"""
import json
import sys
import urllib.request
from pathlib import Path


def get_neondash_page_id() -> str | None:
    """Find the neondash page ID via CDP /json/list."""
    try:
        with urllib.request.urlopen("http://localhost:9222/json/list", timeout=3) as resp:
            pages = json.loads(resp.read())
        for p in pages:
            if p.get("type") == "page" and "neondash" in p.get("url", ""):
                return p["id"]
    except Exception:
        pass
    return None


def main() -> None:
    output = sys.argv[1] if len(sys.argv) > 1 else "screenshot.png"

    page_id = get_neondash_page_id()
    if not page_id:
        print("No neondash page found in Chrome")
        sys.exit(1)

    print(f"Found page: {page_id}")
    print("Use agent-browser with Windows Chrome for full interaction")


if __name__ == "__main__":
    main()
