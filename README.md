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

The Pages project is named `kiyaverse`; previews attach to pull request branches and production deploys target `main`.
