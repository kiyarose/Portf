# Contributing to this template

This repository is a community-friendly template. If you find a bug or want to propose improvements:

- Open an issue in the template's repository (or your fork) describing the change.
- Send a PR against `main` with a focused change and clear description/screenshots for visual changes.

If you've forked this template to make a personal portfolio, treat your fork as the canonical source for your site and maintain your own issues/PRs there.

---

Below are suggestions and quick checks to help you convert this repo into your own project, or to accept contributions to the template itself.

## For people using this template (your fork)

- Keep your fork as the canonical source for your personal site. Maintain issues/PRs on your fork and update the following files early in your edit process:
  - `README.md` — update site name, short description, and deploy steps.
  - `LICENSE` — replace the copyright line (see `LICENSE.example` for guidance).
    - Important: this template includes a BSD-3-Clause `LICENSE` that must be preserved as-is in the source
      when redistributing or publishing derived works (see `LICENSE.example` for how to add your own copyright
      attribution without removing the original line).
  - `public/fallback/index.html` and `src/data/*` — replace demo content with your personal content.

- If you plan to accept outside contributions on your fork, add a `CODE_OF_CONDUCT.md`, a `PULL_REQUEST_TEMPLATE.md`, and/or an `ISSUE_TEMPLATE/` directory so contributors have clear expectations.

## For contributors to this template repository

- Keep changes small and focused. This repo is used as a starting point for many forks, so API and config stability matters.
- Before submitting a PR, run the normal checks:
  - `npm run lint`
  - `npm run build`
  - Run tests where present (`npm test` / Playwright checks)
  - Update/add documentation or inline comments for new features.

## Customizing contribution policies

You may want a different collaboration model depending on how public you want the project to be:

- Public template (default): allow issues and PRs from the community, protect `main` with branch protections, and enable CI checks.
- Private/managed template: restrict PRs to maintainers, require issue approval or design review before merging.

Suggested repo files to add if you change the model:

- `CODE_OF_CONDUCT.md` — sets community expectations.
- `PULL_REQUEST_TEMPLATE.md` — helps contributors include tests, screenshots, or migration notes.
- `CODEOWNERS` — assigns reviewers automatically.

## Security and license reminders

- This repo ships a default `LICENSE` (BSD 3-Clause). If you change the license for your fork, update the `LICENSE` file and the `package.json` `license` field.
- Preserve existing license headers and notices when redistributing or modifying upstream code. See `LICENSE.example` for guidance on common license choices and how to update attribution.
  - Preserve existing BSD-3-Clause headers and notices (including the 2025 Kiya Rose attribution) when redistributing or modifying upstream code. `LICENSE.example` shows how to add your own copyright line in
    addition to the original notice so legal attribution is not lost.
- If you add new developer tools (linters, scanners, or CI steps) that require secrets or external services, document how to configure them in the `README.md` and `SECURITY.md` so downstream users can replicate or opt out.

---

If you want, I can also add example `PULL_REQUEST_TEMPLATE.md` and `CODE_OF_CONDUCT.md` files tailored for a template repository.
# Contributing to this template

This repository is a community-friendly template. If you find a bug or want to propose improvements:

- Open an issue in the template's repository (or your fork) describing the change.
- Send a PR against `main` with a focused change and clear description/screenshots for visual changes.

If you've forked this template to make a personal portfolio, treat your fork as the canonical source for your site and maintain your own issues/PRs there.
