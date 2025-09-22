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
  await page.evaluate(async () => {
    const root = document.scrollingElement ?? document.body;
    if (!root) return;

    const timeoutMs = 5_000;
    const start = performance.now();

    await new Promise<void>((resolve) => {
      const distance = 400;
      const delay = 60;

      const step = () => {
        const reachedBottom =
          window.innerHeight + window.scrollY >= root.scrollHeight;
        const elapsed = performance.now() - start;

        if (reachedBottom || elapsed >= timeoutMs) {
          resolve();
          return;
        }

        window.scrollBy(0, distance);
        window.setTimeout(step, delay);
      };

      step();
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  });
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
