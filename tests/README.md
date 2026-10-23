# `tests/` guide

This directory contains Playwright end-to-end tests:

- `a11y.spec.ts` - accessibility checks (Axe)
- `theme-consistency.spec.ts` - theme persistence/behavior checks
- `screenshot.spec.ts` - visual screenshot capture
- `remote-data.spec.ts` - optional remote-data integration check (runs only when `E2E_REMOTE_DATA_URL` is set)

Run with:

```bash
npm run test:e2e
```

Remote data check example:

```bash
VITE_REMOTE_DATA_URL="https://data.kiya.cat/data" npm run build
E2E_REMOTE_DATA_URL="https://data.kiya.cat/data" CI=1 PORT=4174 npx playwright test tests/remote-data.spec.ts
```

Unit tests run with Vitest via:

```bash
npm run test
```
