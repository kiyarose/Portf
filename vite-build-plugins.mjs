import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ADMIN_ASSETS_DIR = resolve(__dirname, "admin-assets");
const TOOLS_DIR = resolve(__dirname, "src/tools");

const TOOL_SLUGS = ["visualizeme", "convert"];

export const TOOL_HTML_INPUTS = Object.fromEntries(
  TOOL_SLUGS.map((slug) => [
    `tools/${slug}.html`,
    resolve(TOOLS_DIR, `${slug}.html`),
  ]),
);

const TOOL_ASSET_DIRECTORIES = [
  {
    source: resolve(TOOLS_DIR, "json"),
    relative: ["tools", "json"],
  },
];

function copyDirectory(source, destination) {
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

export function copyAdminAssets() {
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

export function copyToolAssets() {
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
        if (!existsSync(destination)) {
          mkdirSync(destination, { recursive: true });
        }
        copyDirectory(directory.source, destination);
      }
    },
  };
}
