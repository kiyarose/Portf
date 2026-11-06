import { test } from "@playwright/test";

test("debug page load", async ({ page }) => {
  // Listen to console messages
  page.on("console", (msg) => console.log("BROWSER:", msg.text()));

  // Listen to page errors
  page.on("pageerror", (error) =>
    console.log("PAGE ERROR:", error.message, error.stack),
  );

  await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load");

  // Wait a bit for React to render
  await page.waitForTimeout(2000);

  // Check if main exists
  const mainExists = await page.locator("main").count();
  console.log("Main element count:", mainExists);

  // Get page content
  const body = await page.locator("body").innerHTML();
  console.log("Body HTML length:", body.length);
  console.log(
    "Body classes:",
    await page.locator("body").getAttribute("class"),
  );

  // Check for #root
  const root = await page.locator("#root").innerHTML();
  console.log("Root HTML length:", root.length);
  console.log("Root first 500 chars:", root.substring(0, 500));
});
