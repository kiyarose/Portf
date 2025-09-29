import { test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
// Use dynamic import for fs to avoid issues in ESM/test environments

// Add more routes as you grow:
const routes = ["/"]; 

test("collect axe violations (JSON only)", async ({ page }) => {
  const allViolations = [];

  for (const url of routes) {
    await page.goto(url, { waitUntil: "networkidle" });
    // Use AxeBuilder directly instead of injectAxe
    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    // Use the Violation type from axe-core for type safety
    type Violation = import("axe-core").Result;

    results.violations.forEach((v: Violation) => {
      (v as unknown as { pageUrl: string }).pageUrl = url;
    });
    allViolations.push(...results.violations);
  }

  if (allViolations.length) {
    const { writeFileSync } = await import("fs");
    writeFileSync("axe-report.json", JSON.stringify(allViolations, null, 2));
  }
});
