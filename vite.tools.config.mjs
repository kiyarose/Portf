import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  TOOL_HTML_INPUTS,
  copyAdminAssets,
  copyToolAssets,
} from "./vite-build-plugins.mjs";

const projectRoot = dirname(fileURLToPath(import.meta.url));

function relocateToolHtml() {
  return {
    name: "relocate-tool-html",
    apply: "build",
    closeBundle() {
      const nestedToolsDir = resolve(projectRoot, "dist/src/tools");
      const targetToolsDir = resolve(projectRoot, "dist/tools");
      if (!existsSync(nestedToolsDir)) {
        return;
      }
      mkdirSync(targetToolsDir, { recursive: true });
      for (const file of ["convert.html", "visualizeme.html"]) {
        const source = join(nestedToolsDir, file);
        if (existsSync(source)) {
          cpSync(source, join(targetToolsDir, file));
        }
      }
      rmSync(resolve(projectRoot, "dist/src"), { recursive: true, force: true });
    },
  };
}

function normalizeBasePath(value) {
  if (!value || value === "/") {
    return "/";
  }
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export default defineConfig({
  base: normalizeBasePath(process.env.BASE_PATH),
  plugins: [
    react(),
    copyAdminAssets(),
    copyToolAssets(),
    relocateToolHtml(),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: TOOL_HTML_INPUTS,
    },
  },
});
