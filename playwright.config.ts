import { defineConfig } from "@playwright/test";
import { createServer } from "net";

async function findAvailablePort(startPort = 4173): Promise<number> {
  return new Promise((resolve, reject) => {
    const tryPort = (port: number) => {
      const server = createServer();

      server.listen(port, () => {
        server.close(() => resolve(port));
      });

      server.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
    };

    tryPort(startPort);
  });
}

// Determine port based on environment
const isCI = Boolean(process.env.CI);
const port = isCI
  ? parseInt(process.env.PORT || "4173", 10) // Use PORT env var in CI, fallback to 4173
  : await findAvailablePort(4173); // Dynamic port detection for local development

export default defineConfig({
  use: {
    baseURL: `http://localhost:${port}`,
  },
  // Only configure webServer for local development
  // In CI, the preview server is started manually by GitHub Actions workflows
  ...(isCI
    ? {}
    : {
        webServer: {
          command: `npm run preview -- --port ${port}`,
          url: `http://localhost:${port}`,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
  reporter: [["html", { open: "never" }]],
});
