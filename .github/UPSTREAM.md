# Upstream template (SillyLittleTech/Portf)

[kiyarose/Portf](https://github.com/kiyarose/Portf) is **not** a GitHub fork of the template. It shares history with [SillyLittleTech/Portf](https://github.com/SillyLittleTech/Portf). Git remotes are **per clone** — nothing in the repo can set `upstream` on your laptop for you.

## One-time setup (every machine / fresh clone)

```bash
git remote add upstream https://github.com/SillyLittleTech/Portf.git
git fetch upstream
git remote -v
```

You should see:

- `origin` → your `kiyarose/Portf` (push/pull)
- `upstream` → `SillyLittleTech/Portf` (fetch only is fine)

If `upstream` already exists with a wrong URL:

```bash
git remote set-url upstream https://github.com/SillyLittleTech/Portf.git
git fetch upstream
```

## One-time: auto-keep bespoke files on merge

Git can prefer **your** copy when both sides changed the same path. Enable once per clone:

```bash
git config merge.ours.driver true
```

Paths are listed in [`.gitattributes`](../.gitattributes) (`merge=ours`) and in [`.github/upstream-sync.json`](upstream-sync.json) (`keepOurs` globs).

## Machine-readable manifest

[`.github/upstream-sync.json`](upstream-sync.json) records the upstream remote, last merged upstream SHA, bespoke path globs, and post-merge checks (for example `data.kiya.cat` in `security-headers.config.ts`).

After a successful sync PR, update `lastMergedUpstreamSha` and `lastMergedAt` in that file.

## NPM helpers

```bash
npm run upstream:status              # commits ahead/behind (exit 1 if upstream has new commits)
npm run upstream:status -- --stat    # include diff stat
npm run upstream:status -- --json    # machine-readable output

npm run upstream:resolve-conflicts   # after merge: git checkout --ours for keepOurs paths, then verify CSP markers
```

## Safe sync workflow

```bash
git fetch upstream
git checkout main
git pull origin main
git checkout -b sync/upstream-YYYYMMDD
npm run upstream:status -- --stat    # optional: see what you are about to merge
git merge upstream/main
npm run upstream:resolve-conflicts   # then fix any remaining conflicts by hand
```

Resolve conflicts:

| Prefer **your** copy (`ours`) | Prefer **upstream** when it’s a generic fix |
|-----------------------------|---------------------------------------------|
| `src/data/**` | `src/hooks/**`, shared components, Astro tooling |
| `src/translations/**` (your copy) | `scripts/**`, tests (review first) |
| `README.md`, brand assets | CSP/hydration fixes (re-apply `data.kiya.cat` in headers) |
| `.github/workflows/**`, `wrangler.toml`, `.firebaserc` | |
| `connect-src` / `data.kiya.cat` in security headers | |

Then:

```bash
npm ci
npm test
npm run build
npm run verify:security-headers
```

Confirm `connect-src` still includes `https://data.kiya.cat` in [`security-headers.config.ts`](../security-headers.config.ts) and [`public/_headers`](../public/_headers). Update `lastMergedUpstreamSha` in [`upstream-sync.json`](upstream-sync.json).

Open a PR on **kiyarose/Portf**; do not merge `upstream/main` straight to `main` without review.

## Cherry-pick a single upstream commit

```bash
git fetch upstream
git checkout -b sync/cherry-pick-SHORTSHA
git cherry-pick <commit-sha>
```

## Push fixes back to the template

Open a PR on **SillyLittleTech/Portf** (from a branch on a fork you control). Example: CSP / Astro hydration fix — see [kiyarose/Portf#565](https://github.com/kiyarose/Portf/pull/565).

## Deploy stays on your repo

Cloudflare Pages / secrets / `VITE_REMOTE_DATA_URL=https://data.kiya.cat/data` stay tied to **kiyarose/Portf**, not the template.

## Optional: compare without merging

```bash
git fetch upstream
git log --oneline main..upstream/main    # commits on template you don't have
git log --oneline upstream/main..main    # commits only on your fork
git diff main...upstream/main --stat     # file-level diff
```