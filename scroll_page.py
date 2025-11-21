import argparse
import asyncio
from typing import Optional

from playwright.async_api import async_playwright


async def scroll_page(
    url: str,
    *,
    step: int = 500,
    pause_seconds: float = 0.5,
    max_scrolls: int = 200,
    viewport_height: int = 900,
    headless: bool = True,
    device: Optional[str] = None,
    screenshot: Optional[str] = None,
) -> None:
    """Open the given URL and scroll to the bottom of the page.

    The function scrolls the page in ``step``-pixel increments, pausing
    ``pause_seconds`` after each scroll to allow lazy-loaded content to render.
    Scrolling stops when the page height stops increasing or ``max_scrolls`` is
    reached. If ``screenshot`` is provided, a full-page screenshot is written
    once scrolling finishes. If ``device`` is provided, the page emulates the
    named Playwright device descriptor so you can verify mobile behavior.
    """

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context_kwargs = {}

        if device:
            try:
                descriptor = p.devices[device]
            except KeyError as exc:
                raise SystemExit(
                    f"Unknown device '{device}'. Use one of: {', '.join(sorted(p.devices.keys()))}"
                ) from exc
            context_kwargs.update(descriptor)
        else:
            context_kwargs["viewport"] = {"width": 1440, "height": viewport_height}

        context = await browser.new_context(**context_kwargs)
        page = await context.new_page()
        await page.goto(url)

        last_height = 0
        for _ in range(max_scrolls):
            await page.evaluate("window.scrollBy(0, arguments[0]);", step)
            await page.wait_for_timeout(int(pause_seconds * 1000))
            new_height = await page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

        if screenshot:
            await page.screenshot(path=screenshot, full_page=True)

        await browser.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scroll through a webpage for inspection.")
    parser.add_argument("url", help="Page URL to open.")
    parser.add_argument("--step", type=int, default=500, help="Pixels to scroll per tick (default: 500).")
    parser.add_argument("--pause", type=float, default=0.5, help="Seconds to wait after each scroll (default: 0.5).")
    parser.add_argument("--max-scrolls", type=int, default=200, help="Maximum scroll actions before stopping.")
    parser.add_argument("--viewport-height", type=int, default=900, help="Viewport height in pixels (default: 900).")
    parser.add_argument("--headed", action="store_true", help="Run the browser in headed mode to watch the scrolling.")
    parser.add_argument("--device", help="Name of a Playwright device descriptor to emulate (e.g., 'iPhone 13').")
    parser.add_argument("--screenshot", help="Optional path for a full-page screenshot after scrolling.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    asyncio.run(
        scroll_page(
            args.url,
            step=args.step,
            pause_seconds=args.pause,
            max_scrolls=args.max_scrolls,
            viewport_height=args.viewport_height,
            headless=not args.headed,
            device=args.device,
            screenshot=args.screenshot,
        )
    )


if __name__ == "__main__":
    main()
