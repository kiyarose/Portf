# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the application code: `sections/` owns page sections, `components/` provides shared UI, `data/` holds portfolio content and helper metadata (for example the build label generator), and `providers/` exposes the theme context.
- Tailwind styles live in `src/index.css`, utilities in `src/utils/`, and global config in `tailwind.config.js`, `postcss.config.js`, and `vite.config.ts`.
- `npm run build` outputs to `dist/`, which Firebase Hosting serves via `firebase.json`.
- `.github/workflows/` houses CI/CD pipelines—update them when scripts or deploy behavior changes.
- Top-level layout pieces (`SiteHeader`, `PrimaryNav`, `SiteFooter`) live in `src/App.tsx`; keep large JSX trees broken into helpers to satisfy lint rules.
- The root `LICENSE` is BSD 3-Clause (2025, Kiya Rose); mirror that notice when legal text appears elsewhere.
- `src/data/build.ts` exposes helpers for the build label and build timestamp: the label stores a random prefix in `localStorage` keyed by the build signature so it only changes when the code does, and `getBuildUpdatedAt()` surfaces the deploy timestamp for privacy/legal copy—leave that flow intact.
- `src/AppRouter.tsx`, `src/pages/PrivacyPolicyPage.tsx`, and `src/utils/navigation.ts` handle lightweight client-side routing so `/privacy-policy` renders inside the React app without duplicating static assets.

## Environment Variables

- Secrets follow the `VITE_` prefix. Note that `VITE_TURNSTYLE_SITE` is spelled without the second “t” on purpose; do not rename it to `VITE_TURNSTILE_SITE`.

## Build, Test, and Development Commands

- `npm install` (or `npm ci` in CI) installs dependencies; rerun after adding libraries like Framer Motion or @dnd-kit.
- `npm run dev` launches Vite with hot reloading at http://localhost:5173.
- `npm run lint` runs ESLint; keep the tree warning-free before opening a PR.
- `npm run build` compiles TypeScript and bundles the app for Firebase Hosting.

## Coding Style & Naming Conventions

- Follow Prettier defaults (two-space indent, trailing commas where supported). Use `npx prettier --check "src/**/*.{ts,tsx}"` before committing.
- Components use PascalCase, hooks are camelCase, and Tailwind utility compositions live in the JSX className strings.
- Favor rounded Material-style surfaces (`rounded-3xl`, `shadow-card`) and translucent layers for depth.
- Never commit Firebase secrets; rely on `.env.local` or GitHub Secrets for credentials.

## Design & Interaction Guidelines

- Maintain the sleek, minimal aesthetic with rounded Material-style cards and soft shadows.
- Accent palette leans warm orange and pink (`accent.DEFAULT` `#f97316`, `accent.muted` `#ec4899`); dark mode remains deep slate—match those tones across new UI.
- Use rounded Material Symbols icons for navigation, social chips, and headers to keep iconography consistent.
- Drive animations with Framer Motion; always respect `prefers-reduced-motion` and provide sensible fallbacks (toggle animation uses short fade/slide, not full spins).
- The custom `.font-kiya` (Nanum Pen Script) highlights the name “Kiya Rose”; apply it consistently when the name appears in new sections.
- The footer should surface a dynamic current year, the typographic © symbol, the `.font-kiya` name, and the build label (prefix = last edit signature, suffix = render id) alongside the “Crafted with React, Tailwind CSS, and Firebase.” line, with a pill-style tooltip explaining the two segments.
- Privacy and legal copy should pull their “Last updated” value from `getBuildUpdatedAt()` so the date reflects the latest build automatically—never hardcode the date.
- Developing skills use a dotted accent pill—follow the existing `isDeveloping` pattern in `SkillsSection` when adding new skills.
- The contact form generates a `mailto:` draft; keep it client-only (no POST handlers) and preserve the copy-to-clipboard CTA.
- The fallback page in `public/index.html` should mirror the warm accent palette; update gradients/buttons there when the brand colors change.

## Testing Guidelines

- Co-locate tests beside components as `<name>.test.tsx` or under `src/tests/`.
- Once tests exist, wire them to `npm test` and enforce them in CI before `npm run build`.
- Capture Lighthouse or visual diffs for UI-heavy changes and attach them to PRs.
- Tests should confirm mailto generation/utility behavior when touching the Contact section’s form logic.

## Commit & Pull Request Guidelines

- Keep commit messages short and imperative (`Add education timeline`, `Polish theme toggle`).
- PRs should include a summary, linked issues, screenshots/GIFs for UI updates, and the Firebase preview URL surfaced by CI.
- Validate `npm run lint` and `npm run build` locally before requesting review.

## Firebase Hosting Tips

- Use `firebase emulators:start --only hosting` to preview rewrites and headers locally.
- Prefer GitHub Actions for deploys; reserve manual `firebase deploy --only hosting` for emergencies so release history stays auditable.

## Native Companion Tooling

- `$DashCam!/` hosts the **DashCam!** SwiftUI dashboard that starts, stops, and restarts the `npm run dev` and `npx playwright codegen` tasks; adjust `DashboardViewModel`/`ProcessController` plus the bundled `DashCam.app` and `dashcam_swift.tgz` whenever those commands or their default paths change.
- Build the app with Xcode 15+ on macOS 13+; its Swift sources live under `$DashCam!/Sources/DashboardApp`, and the SwiftPM manifest is `$DashCam!/Package.swift`.

## AI Assistant Guidance

- `.github/copilot-instructions.md` documents the expectations for GitHub Copilot and other AI helpers—keep it aligned with this file when design language, workflows, or toolchain requirements shift.
- Whenever you update `AGENTS.md`, make sure `.github/copilot-instructions.md` reflects the same guidance.
- **DO NOT create random `.md` files** in the repository root. All technical documentation should be consolidated into this file (`AGENTS.md`) or `.github/copilot-instructions.md`. The only `.md` files that should exist in the root are: `README.md`, `LICENSE` (if markdown), `CONTRIBUTING.md`, `SECURITY.md`, and `AGENTS.md`.

## Security & ZAP Configuration

### Security Headers

All security headers are centrally defined in `security-headers.config.ts` and deployed via:

- `public/_headers` (for Cloudflare Pages - primary deployment)
- `firebase.json` (for Firebase Hosting - reference/backup)
- `vite.config.ts` (for local preview server)

Current security headers include:

- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (anti-clickjacking)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restricts camera, microphone, geolocation)
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- `Cross-Origin-Embedder-Policy: credentialless` (Spectre protection)
- `Content-Security-Policy` (comprehensive XSS/injection protection)

### ZAP Scan Configuration

The `.zap-ignore` file contains known/accepted alerts that don't need fixing:

- **10055** (CSP unsafe-inline): Required for Framer Motion inline styles
- **90003** (SRI Missing on Google Fonts): Dynamic CSS prevents SRI usage
- **10094** (Base64 Disclosure): Expected in build artifacts
- **10027/10109/40035** (Informational): Not actual vulnerabilities
- **90005** (Sec-Fetch headers): Browser-set request headers, not response headers
- **10049/10015/10050** (Cache directives): Properly configured

The ZAP workflow (`.github/workflows/zap.yml`) scans the production site at `https://kiya.cat` nightly to detect security issues.

When ZAP reports issues:

1. Check if headers are properly set in `public/_headers`
2. Verify deployment to Cloudflare Pages includes the headers
3. Add to `.zap-ignore` ONLY if it's a known limitation or false positive
4. Format: `<alert_id>\tIGNORE\t(Reason)` (TAB-separated)

### Error Handling & Security

All error messages are sanitized via `src/utils/errorSanitizer.ts` to prevent information disclosure:

- Use `safeConsoleWarn()` and `safeConsoleError()` instead of raw console methods
- Never log API keys, file paths, or sensitive data
- ErrorBoundary component catches React errors and shows user-friendly messages
- Production mode provides generic messages; development mode shows debug info

### PostCSS CLI

The project includes PostCSS CLI for enhanced Tailwind CSS workflows:

- `npm run css:build` - Build CSS using PostCSS
- `npm run css:watch` - Watch and rebuild CSS
- Fully compatible with existing Vite build process

## GitHub Automation

### Label & Project Board Sync

- Issues automatically added to "Portfolio Devmt" project in "Backlog" status
- Labels sync bidirectionally between linked issues and PRs
- Issue status updates based on PR lifecycle:
  - "In Progress" when PR is opened (including draft)
  - "In Review" when PR is ready for review or merged
  - "Done" when PR is closed/merged (via GitHub built-in automation)
- Milestones sync between linked issues and PRs
- ZAP Scan issues automatically get labels: `Meta`, `Stylistic`, `javascript`, `meta:seq`, `ZAP!`

### Linking Issues to PRs

Use these keywords in PR title/body:

- Simple reference: `#105`
- Closing keywords: `fixes #105`, `closes #105`, `resolves #105`
- Full GitHub URLs to issues

Multiple PRs can reference the same issue; status reflects the most recent PR action.
