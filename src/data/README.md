# `src/data/` guide

These files provide local fallback content for the portfolio sections.

## Files

- `projects.ts`
- `experience.ts`
- `education.ts`
- `certifications.ts`
- `skills.ts`
- `socials.ts`
- `build.ts` (build label + build timestamp helpers)

## Remote vs local behavior

Data resolution is handled by `scripts/sync-remote-data.mjs` and
`src/hooks/useRemoteData.ts`:

- `VITE_REMOTE_DATA_URL` **set** -> browser fetches `${VITE_REMOTE_DATA_URL}/{Resource}.json`
  from the CDN (CORS + `connect-src`); build also syncs copies into `public/__remote-data/`
  as an offline snapshot
- `VITE_REMOTE_DATA_URL` **not set** -> use local `*Fallback` exports
- Remote fetch errors -> use `*Placeholder` exports for clear failure messaging

## Resource naming contract

Each data file exports a `*_RESOURCE` constant (e.g. `PROJECTS_RESOURCE = "Projects"`).
Remote files should match this naming pattern, including capitalization.

Example:

- `https://data.example.com/Projects.json`
- `https://data.example.com/Skills.json`

## Adding a new data-backed section

1. Create `<section>.ts` with:
   - Type definition
   - `<SECTION>_RESOURCE`
   - `<section>Fallback`
   - `<section>Placeholder`
2. Consume it in a section component with `useRemoteData`.
3. Add copy in translation JSON files.
