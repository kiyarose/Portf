import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI, // faster local runs
    timeout: 120_000,
  },
  reporter: [["html", { open: "never" }]],
});
