# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the application code: `sections/` owns page sections, `components/` provides shared UI, `data/` holds portfolio content and helper metadata (for example the build label generator), and `providers/` exposes the theme context.
- Tailwind styles live in `src/index.css`, utilities in `src/utils/`, and global config in `tailwind.config.js`, `postcss.config.js`, and `vite.config.ts`.
- `npm run build` outputs to `dist/`, which Firebase Hosting serves via `firebase.json`.
- `.github/workflows/` houses CI/CD pipelines—update them when scripts or deploy behavior changes.
- Top-level layout pieces (`SiteHeader`, `PrimaryNav`, `SiteFooter`) live in `src/App.tsx`; keep large JSX trees broken into helpers to satisfy lint rules.
- The root `LICENSE` is BSD 3-Clause (2025, Kiya Rose); mirror that notice when legal text appears elsewhere.
- `src/data/build.ts` exposes a helper that generates a build label: it stores a random prefix in `localStorage` keyed by the build signature so it only changes when the code does—leave that flow intact.

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
- The custom `.font-kiya` (Patrick Hand) highlights the name “Kiya Rose”; apply it consistently when the name appears in new sections.
- The footer should surface a dynamic current year, the typographic © symbol, the `.font-kiya` name, and the build label (prefix = last edit signature, suffix = render id) alongside the “Crafted with React, Tailwind CSS, and Firebase.” line, with a pill-style tooltip explaining the two segments.
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
