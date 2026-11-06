import { expect, test } from "@playwright/test";

test.describe("Homepage interactivity", () => {
  test("hero, experience details, theme, and language toggles work", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: /Health IT & Support Pro in Training/i,
      }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByText(/Administrative Project Lead/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Served as the Administrative Project Lead/i),
    ).toBeVisible();

    const themeToggleIcon = page
      .getByRole("button", {
        name: /toggle light or dark theme/i,
      })
      .locator("svg");
    await expect(themeToggleIcon).toBeVisible();
    await expect(themeToggleIcon.locator("path, use")).not.toHaveCount(0);

    const navIconCount = await page.locator("nav svg.iconify").count();
    expect(navIconCount).toBeGreaterThanOrEqual(5);

    const themeToggle = page.getByRole("button", {
      name: /toggle light or dark theme/i,
    });
    const beforeTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
    await themeToggle.click();
    const afterTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
    expect(afterTheme).not.toBe(beforeTheme);

    const languageToggle = page.getByRole("button", {
      name: /select language/i,
    });
    await languageToggle.click();
    await page.getByRole("button", { name: /Français/i }).click();
    await expect(languageToggle).toContainText("FR");

    const hydrationErrors = consoleErrors.filter(
      (line) =>
        line.includes("hydrat") ||
        line.includes("astro-island") ||
        line.includes("Minified React error"),
    );
    expect(hydrationErrors).toEqual([]);
  });
});
