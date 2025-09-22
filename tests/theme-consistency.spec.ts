import { test, expect } from "@playwright/test";

test.describe("Theme Consistency", () => {
  test("manual theme toggle should override system preference", async ({
    page,
  }) => {
    // Start with a clean slate
    await page.goto("/");

    // Clear any existing theme preference
    await page.evaluate(() => {
      window.localStorage.removeItem("kiya-theme");
      window.localStorage.removeItem("kiya-theme-user-set");
    });

    // Reload to ensure clean state
    await page.reload();

    // Get initial theme state
    const getTheme = () =>
      page.evaluate(() =>
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );

    const getUserSetFlag = () =>
      page.evaluate(
        () => window.localStorage.getItem("kiya-theme-user-set") === "true",
      );

    // Initially, user should not have set theme manually
    expect(await getUserSetFlag()).toBe(false);

    const initialTheme = await getTheme();

    // Toggle theme manually
    const toggleButton = page.getByRole("button", {
      name: /toggle light or dark theme/i,
    });
    await toggleButton.click();

    // Verify theme changed
    const newTheme = await getTheme();
    expect(newTheme).not.toBe(initialTheme);

    // Verify user preference is now set
    expect(await getUserSetFlag()).toBe(true);

    // Verify the theme toggle button reflects the correct state
    const buttonText = await toggleButton.textContent();
    if (newTheme === "dark") {
      expect(buttonText).toContain("Light mode");
    } else {
      expect(buttonText).toContain("Dark mode");
    }

    // Simulate a system theme change by dispatching media query change event
    // This should NOT change the theme since user has manually set it
    await page.evaluate((currentTheme) => {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const event = new MediaQueryListEvent("change", {
        matches: currentTheme === "light", // Opposite of current theme
        media: "(prefers-color-scheme: dark)",
      });
      media.dispatchEvent(event);
    }, newTheme);

    // Wait a bit for any potential changes
    await page.waitForTimeout(100);

    // Theme should remain unchanged despite system preference change
    expect(await getTheme()).toBe(newTheme);
  });

  test("theme persistence across page reloads", async ({ page }) => {
    await page.goto("/");

    // Clear any existing preferences
    await page.evaluate(() => {
      window.localStorage.removeItem("kiya-theme");
      window.localStorage.removeItem("kiya-theme-user-set");
    });

    await page.reload();

    // Toggle theme
    const toggleButton = page.getByRole("button", {
      name: /toggle light or dark theme/i,
    });
    await toggleButton.click();

    const getTheme = () =>
      page.evaluate(() =>
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );

    const themeAfterToggle = await getTheme();

    // Reload page
    await page.reload();

    // Theme should persist
    expect(await getTheme()).toBe(themeAfterToggle);

    // User preference flag should also persist
    const userSetFlag = await page.evaluate(() =>
      window.localStorage.getItem("kiya-theme-user-set"),
    );
    expect(userSetFlag).toBe("true");
  });
});
