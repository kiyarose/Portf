# Repository Guidelines

## Project Structure & Module Organization
- `public/` holds all deployable assets; update `public/index.html` for new sections or routes.
- Keep SPA rewrites in `firebase.json` pointing to `/index.html`; register extra asset folders only when routing differs.
- `.github/workflows/` runs the build-and-deploy automation; edit these when npm scripts or Firebase targets change.
- Until a build pipeline exists, group feature bundles under `public/sections/<feature>/`.

## Build, Test, and Development Commands
- `npm install` (or `npm ci` when the lockfile is present) installs dependencies as CI expects.
- `npm run build` must pass before merging; workflows run it and publish to Hosting.
- `npm run dev` serves the site locally; pair it with `firebase emulators:start --only hosting` to preview routes.

## Coding Style & Naming Conventions
- Follow Prettier defaults (two-space indent, trailing commas where allowed); run `npx prettier --check "public/**/*.js"` before committing.
- Name files and CSS classes in lowercase-kebab (`public/sections/about-me.js`, `.hero-banner`), and keep IDs unique to prevent routing collisions.
- Keep Firebase keys and secrets in environment configs (`.env.local`), never inline in HTML or committed JS.

## Design & Interaction Guidelines
- Aim for a sleek, minimal layout with rounded corners and soft shadows reminiscent of material cards.
- Use rounded Material Symbols icons for navigation, section headers, and social links to keep visuals consistent.
- Implement smooth, subtle animations with Framer Motion while respecting `prefers-reduced-motion`.
- Provide a light/dark mode toggle with animated sun/moon icons and ensure both themes stay accessible.

## Testing Guidelines
- Place tests beside features as `<feature>.test.js` or under `tests/`, mirroring the public paths.
- Hook tests into `npm test`; configure CI to run them before `npm run build` once coverage exists.
- Capture Lighthouse metrics or screenshots for UI-heavy changes and attach them to PRs.

## Commit & Pull Request Guidelines
- Use short, imperative commit titles (`Add contact card`, `Refine Firebase config`) with optional body details for complex changes.
- PRs should include a summary, linked issues, visuals for UI updates, and the Firebase preview URL surfaced by CI.
- Verify `npm run build` and new tests locally; list follow-up tasks or migrations directly in the PR checklist.

## Firebase Hosting Tips
- Run `firebase emulators:start --only hosting` for fast local previews before opening a PR.
- Reserve manual `firebase deploy --only hosting` for emergencies; rely on CI deploys so GitHub records remain the source of truth.
