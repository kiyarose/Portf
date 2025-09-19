# Kiya Rose Portfolio

My Personal Portfolio. I put things here, hopefully it looks good.

## Tech Stack

- **React 19 + TypeScript** via Vite
- **Tailwind CSS** for styling with custom material-inspired components
- **Framer Motion** for smooth, accessible animations
- **@dnd-kit** for drag-and-drop skill reordering with localStorage persistence
- **Firebase Hosting** via GitHub Actions for automated deploys

- `VITE_PAGECLIP_API_KEY` - Required for the contact form to work. API key from [Pageclip](https://pageclip.co/).

## Deployment

- Pull requests trigger a Firebase Hosting preview channel through `FirebaseExtended/action-hosting-deploy`, expiring after seven days.
- Merges to `main` run linting, build the production bundle, and deploy to the live hosting channel.

The repository needs a `FIREBASE_SERVICE_ACCOUNT_KIYAVERSE` secret with deploy access to the `kiyaverse` Firebase project.
