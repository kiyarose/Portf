import { test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type ViewportSize = {
  width: number;
  height: number;
};

type SnapshotVariant = {
  fileName: string;
  viewport: ViewportSize;
  theme: "light" | "dark";
  device: "web" | "mobile";
};

const variants: SnapshotVariant[] = [
  {
    fileName: "portfolio-web-light.png",
    viewport: { width: 1440, height: 900 },
    theme: "light",
    device: "web",
  },
  {
    fileName: "portfolio-web-dark.png",
    viewport: { width: 1440, height: 900 },
    theme: "dark",
    device: "web",
  },
  {
    fileName: "portfolio-mobile-light.png",
    viewport: { width: 390, height: 844 },
    theme: "light",
    device: "mobile",
  },
  {
    fileName: "portfolio-mobile-dark.png",
    viewport: { width: 390, height: 844 },
    theme: "dark",
    device: "mobile",
  },
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

    const wait = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    const start = performance.now();
    let stationaryTicks = 0;

    while (performance.now() - start < timeoutMs && stationaryTicks < 4) {
      const currentHeight = root.scrollHeight;
      window.scrollTo({ top: currentHeight, behavior: "auto" });
      await wait(200);

      const newHeight = root.scrollHeight;
      if (newHeight <= currentHeight + 2) {
        stationaryTicks += 1;
      } else {
        stationaryTicks = 0;
      }
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, 18_000);
}

async function ensureTheme(page: Page, theme: "light" | "dark") {
  const getCurrentTheme = () =>
    page.evaluate(() =>
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await getCurrentTheme();
    if (current === theme) {
        await page.evaluate((nextTheme) => {
          window.localStorage.setItem("template-theme", nextTheme);
          window.localStorage.setItem("template-theme-user-set", "true");
      }, theme);
      return;
    }

    const toggle = page.getByRole("button", {
      name: /toggle light or dark theme/i,
    });
    await toggle.click();

    await page
      .waitForFunction(
        (expectedTheme) =>
          document.documentElement.classList.contains("dark") ===
          (expectedTheme === "dark"),
        theme,
        { timeout: 3_000 },
      )
      .catch(() => undefined);

    if ((await getCurrentTheme()) === theme) {
        await page.evaluate((nextTheme) => {
          window.localStorage.setItem("template-theme", nextTheme);
          window.localStorage.setItem("template-theme-user-set", "true");
      }, theme);
      return;
    }

    await page.waitForTimeout(1_000);
  }

  throw new Error(`Unable to set theme to ${theme}`);
}

test("homepage full-page screenshot", async ({ page }) => {
  test.setTimeout(60_000);
  const outDir = path.join(process.cwd(), "playwright-logs");
  fs.mkdirSync(outDir, { recursive: true });

  for (const { fileName, viewport, theme } of variants) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await page
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => undefined);
    await ensureTheme(page, theme);
    await page.waitForTimeout(theme === "dark" ? 600 : 200);
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
