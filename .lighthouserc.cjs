/* eslint-env node */
module.exports = {
  ci: {
    collect: {
      // Build first, then run preview (avoids timeout during build)
      // Note: LHCI may show "WARNING: Timed out waiting for the server to start listening"
      // This is cosmetic - the server starts successfully and Lighthouse runs complete.
      // The warning occurs because Vite's output pattern doesn't match LHCI's default /listen|ready/i regex.
      startServerCommand: "npx vite preview --port 4173 --strictPort",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 30000, // 30 seconds
      url: ["http://localhost:4173/"],
      numberOfRuns: 3,
    },
    assert: {
      // Fail PRs if these regress
      // Note: Performance warnings are expected and acceptable (configured as "warn", not "error")
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "uses-text-compression": "warn",
        "uses-rel-preconnect": "warn",
        "color-contrast": "error",
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
