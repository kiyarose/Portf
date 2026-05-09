# Kiya Rose Portfolio

My Personal Portfolio. I put things here, hopefully it looks good.

## Tech Stack

- **React 19 + TypeScript** via Vite
- **Tailwind CSS** for styling with custom material-inspired components
- **Framer Motion** for smooth, accessible animations
- **@dnd-kit** for drag-and-drop skill reordering with localStorage persistence
- **Cloudflare Pages** for global edge hosting and preview environments

## Environment Variables

- `VITE_PAGECLIP_API_KEY` – Required for the contact form to work. API key from [Pageclip](https://pageclip.co/).
- `VITE_TURNSTILE_SITE_KEY` (or legacy `VITE_TURNSTYLE_SITE`) – Cloudflare Turnstile site key that powers the human verification step on the contact form.

Configure these variables in your local `.env` file and in the Cloudflare Pages project settings so production builds hydrate them at runtime.

## Deployment

- Build with `npm run build` (output in `dist/`), then deploy using Wrangler: `npx wrangler pages deploy dist --project-name kiyaverse --compatibility-date=2024-06-01`.
- GitHub Actions ([`cloudflare-pages-preview.yml`](.github/workflows/cloudflare-pages-preview.yml) and [`cloudflare-pages-merge.yml`](.github/workflows/cloudflare-pages-merge.yml)) run linting, build the bundle, and publish to Cloudflare Pages when enabled. Provide the following repository secrets for automation:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN` (Pages `Edit` + `Deployments` permissions)
  - `VITE_PAGECLIP_API_KEY`
  - `VITE_TURNSTILE_SITE_KEY` (and/or `VITE_TURNSTYLE_SITE` for legacy naming)

The repository needs a `FIREBASE_SERVICE_ACCOUNT_KIYAVERSE` secret with deploy access to the `kiyaverse` Firebase project.

## Data conversion helper

- Source of truth: `src/data/*.ts`.
- Production remote payloads are published to `https://data.kiya.cat/data/*.json`.
- `npm run data:publish` converts `src/data/*.ts` to JSON and uploads all datasets to R2 using Wrangler OAuth.
- `npm run data:to-json -- src/data/projects.ts --out /tmp/Projects.json` exports a specific TypeScript module to JSON with round-trip metadata.
- `npm run data:to-ts -- /tmp/Projects.json` restores the original TypeScript module (use `--overwrite` to replace an existing file).
- Pass `--pick projectsFallback,educationFallback` to work with specific exports when a file contains multiple arrays or objects.
- Open `src/tools/convert.html` in a browser for an all-in-one local UI that handles file drops, selective exports, and downloads without leaving the machine.

## Remote backup sync

- `npm run data:sync:remote` pulls `https://data.kiya.cat/data/*.json` and writes backup snapshots to `public/data/*.json.bak`.
- `.github/workflows/sync-remote-data.yml` runs this sync weekly (and on manual dispatch) and commits backup changes when the endpoint changes.

## JSON visualization helper

- Open `src/tools/visualizeme.html` locally to inspect JSON structures with pan/zoom navigation, modal node editing, search, expand/collapse controls, and SVG export.
- Switch the input mode to load TypeScript data modules directly; the tool converts exports into JSON for editing and can export the updated module back to TypeScript once you save.
