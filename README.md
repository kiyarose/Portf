# Kiya Rose Portfolio

My Personal Portfolio. I put things here, hopefully it looks good.

## Tech Stack

- **React 19 + TypeScript** via Vite
- **Tailwind CSS** for styling with custom material-inspired components
- **Framer Motion** for smooth, accessible animations
- **@dnd-kit** for drag-and-drop skill reordering with localStorage persistence
- **Firebase Hosting** via GitHub Actions for automated deploys

- `VITE_PAGECLIP_API_KEY` - Required for the contact form to work. API key from [Pageclip](https://pageclip.co/).
- `VITE_TURNSTILE_SITE_KEY` (or legacy `VITE_TURNSTYLE_SITE`) - Cloudflare Turnstile site key that powers the human verification step on the contact form.

## Deployment

- Pull requests trigger a Firebase Hosting preview channel through `FirebaseExtended/action-hosting-deploy`, expiring after seven days.
- Merges to `main` run linting, build the production bundle, and deploy to the live hosting channel.

The repository needs a `FIREBASE_SERVICE_ACCOUNT_KIYAVERSE` secret with deploy access to the `kiyaverse` Firebase project.

## Data conversion helper

- `npm run data:to-json -- src/data/projects.ts` exports convertible `export const` values to `src/data/projects.json` alongside round-trip metadata.
- `npm run data:to-ts -- src/data/projects.json` restores the original TypeScript module (use `--overwrite` to replace an existing file).
- Pass `--pick projects,educationTimeline` to work with specific exports when a file contains multiple arrays or objects.
- Open `src/tools/convert.html` in a browser for an all-in-one local UI that handles file drops, selective exports, and downloads without leaving the machine.

## JSON visualization helper

- Open `src/tools/visualizeme.html` locally to inspect JSON structures with pan/zoom navigation, modal node editing, search, expand/collapse controls, and SVG export.
- Switch the input mode to load TypeScript data modules directly; the tool converts exports into JSON for editing and can export the updated module back to TypeScript once you save.
