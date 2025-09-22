import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('homepage full-page screenshot', async ({ page }) => {
  const outDir = path.join(process.cwd(), 'playwright-logs');
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto('/'); 
  await page.screenshot({
    fullPage: true,
    path: path.join(outDir, 'portfolio-working.png'),
    scale: 'css',
    type: 'png'
  });
});
