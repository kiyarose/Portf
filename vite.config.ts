import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ADMIN_ASSETS_DIR = resolve(__dirname, "admin-assets");

function copyDirectory(source: string, destination: string) {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }
  for (const entry of readdirSync(source)) {
    const sourcePath = join(source, entry);
    const destinationPath = join(destination, entry);
    const stats = statSync(sourcePath);
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      copyFileSync(sourcePath, destinationPath);
    }
  }
}

function copyAdminAssets(): Plugin {
  let resolvedOutDir = "";
  let projectRoot = process.cwd();
  return {
    name: "copy-admin-assets",
    apply: "build",
    configResolved(config) {
      resolvedOutDir = config.build.outDir;
      projectRoot = config.root;
    },
    generateBundle() {
      if (!existsSync(ADMIN_ASSETS_DIR)) {
        this.warn("admin-assets directory not found; skipping copy.");
        return;
      }
      const targetDir = resolve(projectRoot, resolvedOutDir, "admin-assets");
      copyDirectory(ADMIN_ASSETS_DIR, targetDir);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyAdminAssets()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
