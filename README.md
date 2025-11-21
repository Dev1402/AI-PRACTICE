# AI-PRACTICE

This repository now includes a small Playwright helper for scrolling through a
webpage to inspect how content loads while you move down the page.

## Scroll a page for inspection

1. Install Playwright and its browser binaries:

   ```bash
   pip install playwright
   playwright install chromium
   ```

2. Run the helper script against a page you want to inspect:

   ```bash
   python scroll_page.py "https://example.com" --screenshot after.png
   ```

   Add `--headed` if you want to watch the browser window while it scrolls, or
   adjust `--step`, `--pause`, and `--max-scrolls` to control the scrolling
   behavior. To verify mobile rendering and scrolling, add `--device` with a
   Playwright device descriptor name (for example, `--device "iPhone 13"`).
