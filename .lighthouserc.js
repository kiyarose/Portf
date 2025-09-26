/* eslint-env node */
module.exports = {
  ci: {
    collect: {
      // Use local preview so PRs don’t rely on prod
      startServerCommand:
        "npm run build && npx vite preview --port 4173 --strictPort",
      url: ["http://localhost:4173/"],
      numberOfRuns: 3,
    },
    assert: {
      // Fail PRs if these regress
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
