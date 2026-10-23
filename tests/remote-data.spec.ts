import { expect, test } from "@playwright/test";

const REMOTE_DATA_URL = process.env.E2E_REMOTE_DATA_URL;

test.skip(
  !REMOTE_DATA_URL,
  "Set E2E_REMOTE_DATA_URL to run remote data integration checks.",
);

test("remote data loads when remote URL is configured", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const heroSection = page.locator(
    'section[data-remote-resource="Socials"][data-remote-enabled="true"]',
  );

  await expect(heroSection).toBeVisible();

  await expect
    .poll(
      async () => heroSection.getAttribute("data-remote-status"),
      {
        timeout: 15_000,
        intervals: [250, 500, 1_000],
      },
    )
    .toBe("loaded");
});
