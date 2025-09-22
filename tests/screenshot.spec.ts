import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test("homepage full-page screenshot", async ({ page }) => {
  const outDir = path.join(process.cwd(), "playwright-logs");
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    // Wait for all fonts/stylesheets to finish loading before capturing the screenshot.
    if (document.fonts?.status !== "loaded") {
      await document.fonts.ready;
    }
  });
  await page.evaluate(async () => {
    // Auto-scroll to trigger lazy-loaded sections before capturing the full-page image.
    await new Promise<void>((resolve) => {
      const distance = 400;
      const delay = 60;
      const step = () => {
        const { scrollHeight } = document.scrollingElement ?? document.body;
        window.scrollBy(0, distance);
        const reachedBottom =
          window.innerHeight + window.scrollY >= scrollHeight;
        if (reachedBottom) {
          resolve();
          return;
        }
        window.setTimeout(step, delay);
      };
      step();
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  await page.waitForTimeout(200);
  await page.screenshot({
    fullPage: true,
    path: path.join(outDir, "portfolio-working.png"),
    scale: "css",
    type: "png",
  });
});
