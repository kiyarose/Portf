import { test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type ViewportSize = {
  width: number;
  height: number;
};

const variants: Array<{ fileName: string; viewport: ViewportSize }> = [
  { fileName: "portfolio-working.png", viewport: { width: 1440, height: 900 } },
  { fileName: "portfolio-mobile.png", viewport: { width: 390, height: 844 } },
];

async function waitForFonts(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts?.status !== "loaded") {
      await document.fonts.ready;
    }
  });
}

async function scrollPage(page: Page) {
  await page.evaluate(async (timeoutMs) => {
    const root = document.scrollingElement ?? document.body;
    if (!root) return;

    const distance = Math.max(200, Math.floor(window.innerHeight * 0.75));
    const wait = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    const start = performance.now();

    // Scroll until bottom is reached or the timeout elapses.
    while (performance.now() - start < timeoutMs) {
      const { scrollHeight } = root;
      window.scrollBy(0, distance);
      await wait(80);

      const atBottom = window.innerHeight + window.scrollY >= scrollHeight;
      if (atBottom) {
        // Allow lazy content to expand; continue if height grows.
        await wait(200);
        const newHeight = root.scrollHeight;
        if (newHeight <= scrollHeight) {
          break;
        }
      }
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, 20_000);
}

test("homepage full-page screenshot", async ({ page }) => {
  const outDir = path.join(process.cwd(), "playwright-logs");
  fs.mkdirSync(outDir, { recursive: true });

  for (const { fileName, viewport } of variants) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForFonts(page);
    await scrollPage(page);
    await page.waitForTimeout(200);
    await page.screenshot({
      fullPage: true,
      path: path.join(outDir, fileName),
      scale: "css",
      type: "png",
    });
  }
});
