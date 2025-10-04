import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
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

const TOOL_SLUGS = ["visualizeme", "convert"] as const;

const TOOL_HTML_INPUTS: Record<string, string> = Object.fromEntries(
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
        if (!existsSync(destination)) {
          mkdirSync(destination, { recursive: true });
        }
        copyDirectory(directory.source, destination);
      }
    },
  };
}

function serveSecurityHeaders(): Plugin {
  return {
    name: "serve-security-headers",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        // Security headers for all responses
        const headers: Record<string, string> = {
          "Strict-Transport-Security":
            "max-age=31536000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
          "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
          "Cross-Origin-Embedder-Policy": "credentialless",
          "Content-Security-Policy":
            "default-src 'self'; img-src 'self' data: https://www.googletagmanager.com; script-src 'self' https://s.pageclip.co https://www.googletagmanager.com https://challenges.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://s.pageclip.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://send.pageclip.co https://api.iconify.design https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://data.sillylittle.tech; frame-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self' https://send.pageclip.co; frame-ancestors 'none'; manifest-src 'self';",
        };

        // Apply headers to response
        for (const [key, value] of Object.entries(headers)) {
          res.setHeader(key, value);
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyAdminAssets(),
    copyToolAssets(),
    serveSecurityHeaders(),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    proxy: {
      "/__remote-data": {
        target: "https://data.sillylittle.tech",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__remote-data/, ""),
      },
    },
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
