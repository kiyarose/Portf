# `src/` guide

This folder contains all application code rendered by Astro + React.

## Structure

- `pages/` - Astro routes (`/` and `/privacy-policy`)
- `layouts/` - Astro layout wrappers (global HTML shell)
- `components/` - shared React UI components
- `sections/` - homepage content sections (hero, about, projects, etc.)
- `providers/` - React context providers (theme + language)
- `hooks/` - behavior hooks (scroll, remote data, local storage, etc.)
- `data/` - local fallback content for each section
- `translations/` - language dictionaries
- `utils/` - helper utilities (navigation, sanitizing, class merging, etc.)

## Editing flow

1. Update content in `src/data/*`.
2. Adjust section rendering in `src/sections/*` when needed.
3. Update labels/copy in `src/translations/*`.
4. Run `npm run test && npm run build`.

## Styling

- Base styles and design tokens are in `src/index.css`.
- Keep current section spacing and card styles unless intentionally redesigning.
