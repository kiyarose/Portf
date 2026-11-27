# Copilot / AI instructions

## Architecture

- Astro + React + TypeScript portfolio template.
- Astro routes live in `src/pages/` (`index.astro`, `privacy-policy.astro`).
- Main UI and section composition remain in React (`src/App.tsx`, `src/sections/*`).
- Local content lives in `src/data/*` and translations in `src/translations/*`.

## Core conventions

- Keep the current visual layout and section order unless explicitly asked to redesign.
- Prefer small, focused edits; preserve accessibility and reduced-motion behavior.
- Use Tailwind utility classes in JSX and keep Material-like rounded card styling.
- Use `.font-kiya` for the display-name accent style.

## Remote data contract

- `VITE_REMOTE_DATA_URL` enables remote JSON fetches. When set at build time, production fetches `${VITE_REMOTE_DATA_URL}/{Resource}.json` from the CDN (not only same-origin `__remote-data`).
- Set it in Cloudflare Pages production so live data does not depend on `dist/__remote-data` copies.
- If no remote URL is set, use local fallback data only.
- On remote fetch failure, show placeholder data (do not silently swap to local fallback).
- Keep this behavior centered in `src/hooks/useRemoteData.ts`.
- Optional `/admin/edit` editor is gated by build flag `PF_ALLOW_NOEDIT=1`; saves go through `functions/api/edadmin/` with server secret `PF_EDADMIN_TOKEN`. Protect `/admin/*` with Cloudflare Access before enabling.

## Upstream template sync

- Follow [`.github/UPSTREAM.md`](UPSTREAM.md) when merging [SillyLittleTech/Portf](https://github.com/SillyLittleTech/Portf).
- Prefer **kiyarose** copies per [`.github/upstream-sync.json`](upstream-sync.json) (`keepOurs`); after `git merge upstream/main`, run `node scripts/resolve-upstream-conflicts.mjs` if `package.json` conflicts break `npm run`. Use `upstream:import-code` or `upstream:status -- --code-only` for allowlisted code-only sync.
- Preserve `data.kiya.cat` in security headers and kiyarose-specific deploy config (`wrangler.toml`, `.github/workflows/**`).

## Build and test commands

- Install: `npm ci`
- Dev: `npm run dev`
- Lint/type check: `npm run lint`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Build: `npm run build`

## Deploy targets

- Cloudflare Pages: output `dist/`, config in `wrangler.toml`, headers in `public/_headers`.
- GitHub Pages: use `npm run build:pages` with `BASE_PATH=/your-repo-name/`.

## Collaboration Notes

- Favor small, composable helper components over deeply nested JSX trees (see `SiteHeader`/`SiteFooter` in `App.tsx`).
- When making UI changes, consider drag-and-drop persistence, localStorage access, the `mailto:` contact workflow, and other side effects already established in the repo.
- Use the existing `isDeveloping` styling in the Skills section when introducing new abilities (dashed border for in-progress skills).
- Keep the fallback page (`public/fallback/index.html`) visually aligned with the main palette when adjusting colors.
- Run `npm run lint` and (when relevant) `npm run build`; clean up generated `dist/` outputs if you run the build locally.
- Keep the build label helper in `src/data/build.ts` intact: it persists a random prefix per build signature in `localStorage`, so only adjust it if that behaviour breaks, and retain the accent tooltip that explains the two segments.
- Keep the macOS Swift companion `DashCam!` in `$DashCam!/`: it manages `npm run dev` and `npx playwright codegen` processes, so update `DashboardViewModel`/`ProcessController` plus the packaged `DashCam.app` or `dashcam_swift.tgz` whenever those workflows change.
- Route-level additions should flow through `src/AppRouter.tsx` with helpers from `src/utils/navigation.ts`; render privacy/legal pages inside React rather than shipping standalone static HTML.
- When you adjust repository guidance, update both `AGENTS.md` and this file so instructions stay in sync.
- **DO NOT create random `.md` files** in the repository root. All technical documentation should be consolidated into `AGENTS.md` or this file (`.github/copilot-instructions.md`). The only `.md` files that should exist in the root are: `README.md`, `LICENSE` (if markdown), `CONTRIBUTING.md`, `SECURITY.md`, and `AGENTS.md`.

## Security

- Keep security headers centralized in `security-headers.config.ts`.
- Keep parity checks working via `npm run verify:security-headers`.
- `script-src` must include `'unsafe-inline'` after the Astro migration: Astro emits inline boot scripts for `client:load` islands and the theme flash-prevention script in `BaseLayout.astro`.
- The ZAP workflow scans `https://kiya.cat` nightly; check `.zap-ignore` for known/accepted alerts.
- When ZAP reports issues, verify headers are in `public/_headers` and deployed properly before adding to `.zap-ignore`.
- Use `safeConsoleWarn()` and `safeConsoleError()` from `src/utils/errorSanitizer.ts` instead of raw console methods to prevent information disclosure.