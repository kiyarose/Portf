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

// Find available port once at startup
const availablePort = await findAvailablePort(4173);

export default defineConfig({
  use: {
    baseURL: `http://localhost:${availablePort}`,
  },
  webServer: {
    command: `npm run preview -- --port ${availablePort}`,
    url: `http://localhost:${availablePort}`,
    reuseExistingServer: !process.env.CI, // faster local runs
    timeout: 120_000,
  },
  reporter: [["html", { open: "never" }]],
});
