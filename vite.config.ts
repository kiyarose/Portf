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
import { SECURITY_HEADERS } from "./security-headers.config";

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
      server.middlewares.use((_req, res, next) => {
        // Apply security headers from master config
        for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
          res.setHeader(key, value);
        }

        next();
      });
    },
  };
}

function proxyDataRequests(): Plugin {
  return {
    name: "proxy-data-requests",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        // Proxy /data/* requests to data.kiya.cat
        if (req.url?.startsWith("/data/")) {
          const targetPath = req.url.replace(/^\/data/, "/data");
          const targetUrl = `https://data.kiya.cat${targetPath}`;

          fetch(targetUrl)
            .then((response) => {
              res.statusCode = response.status;
              res.setHeader(
                "Content-Type",
                response.headers.get("Content-Type") || "application/json",
              );
              // Set CORS headers to allow access
              res.setHeader("Access-Control-Allow-Origin", "*");
              return response.text();
            })
            .then((body) => {
              res.end(body);
            })
            .catch((error) => {
              console.error("Proxy error:", error);
              res.statusCode = 502;
              res.end("Bad Gateway");
            });
        } else {
          next();
        }
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
    proxyDataRequests(),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    proxy: {
      "/__remote-data": {
        target: "https://data.kiya.cat",
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
