import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { edadminDevMiddleware } from "./scripts/edadmin-dev-middleware.mjs";

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
  output: "static",
  site: process.env.SITE_URL || "https://example.com",
  base: normalizeBasePath(process.env.BASE_PATH),
  integrations: [react()],
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "edadmin-dev-proxy",
        configureServer(server) {
          server.middlewares.use(edadminDevMiddleware);
        },
      },
    ],
    envPrefix: ["PUBLIC_", "VITE_"],
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __PF_ALLOW_NOEDIT__: JSON.stringify(process.env.PF_ALLOW_NOEDIT === "1"),
    },
  },
});
