import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ADMIN_ASSETS_DIR = resolve(__dirname, "admin-assets");
const TOOLS_DIR = resolve(__dirname, "src/tools");

const TOOL_SLUGS = ["visualizeme", "convert"] as const;

const TOOL_HTML_INPUTS: Record<string, string> = Object.fromEntries(
  TOOL_SLUGS.map((slug) => [
    `tools/${slug}`,
    resolve(TOOLS_DIR, `${slug}.html`),
  ]),
);

const TOOL_ASSET_DIRECTORIES = [
  {
    source: resolve(TOOLS_DIR, "json"),
    relative: ["tools", "json"],
  },
];

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

function copyToolAssets(): Plugin {
  let resolvedOutDir = "";
  let projectRoot = process.cwd();
  return {
    name: "copy-tool-assets",
    apply: "build",
    configResolved(config) {
      resolvedOutDir = config.build.outDir;
      projectRoot = config.root;
    },
    generateBundle() {
      const targetRoot = resolve(projectRoot, resolvedOutDir);
      for (const directory of TOOL_ASSET_DIRECTORIES) {
        if (!existsSync(directory.source)) {
          continue;
        }
        const destination = resolve(targetRoot, ...directory.relative);
        rmSync(destination, { recursive: true, force: true });
        copyDirectory(directory.source, destination);
      }
    },
  };
}

function relocateToolHtml(): Plugin {
  let resolvedOutDir = "";
  let projectRoot = process.cwd();
  return {
    name: "relocate-tool-html",
    apply: "build",
    configResolved(config) {
      resolvedOutDir = config.build.outDir;
      projectRoot = config.root;
    },
    closeBundle() {
      const distRoot = resolve(projectRoot, resolvedOutDir);
      const builtHtmlDir = resolve(distRoot, "src", "tools");
      if (!existsSync(builtHtmlDir)) {
        return;
      }

      const targetDir = resolve(distRoot, "tools");
      mkdirSync(targetDir, { recursive: true });

      for (const slug of TOOL_SLUGS) {
        const sourcePath = resolve(builtHtmlDir, `${slug}.html`);
        if (!existsSync(sourcePath)) {
          continue;
        }
        const destinationPath = resolve(targetDir, `${slug}.html`);
        copyFileSync(sourcePath, destinationPath);
      }

      const distSrcDir = resolve(distRoot, "src");
      if (existsSync(distSrcDir)) {
        rmSync(distSrcDir, { recursive: true, force: true });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyAdminAssets(), copyToolAssets(), relocateToolHtml()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...TOOL_HTML_INPUTS,
      },
    },
  },
});
