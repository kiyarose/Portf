import { test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { WriteFileOptions } from 'fs';
// Use dynamic import for fs to avoid issues in ESM/test environments

const URL = process.env.PREVIEW_URL || 'http://localhost:4173/';

// Add more routes as you grow:
const routes = [URL];

test('collect axe violations (JSON only)', async ({ page }) => {
  const allViolations = [];

  for (const url of routes) {
    await page.goto(url, { waitUntil: 'networkidle' });
    // Use AxeBuilder directly instead of injectAxe
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    results.violations.forEach((v: any) => (v.pageUrl = url));
    allViolations.push(...results.violations);
  }

  if (allViolations.length) {
    const { writeFileSync } = await import('fs');
    writeFileSync('axe-report.json', JSON.stringify(allViolations, null, 2));
  }
});
