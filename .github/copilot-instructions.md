# Copilot Instructions

## Style & Architecture

- Keep the interface sleek and minimal with rounded Material-style cards, soft shadows, and translucent layers when depth is needed.
- Accent colors lean warm orange/pink (`#f97316` / `#ec4899`) in light mode while dark mode stays slate—mirror those tones in new UI or gradients.
- Use rounded Material Symbols for navigation, section headers, and social chips so iconography stays cohesive.
- Compose Tailwind utility classes directly in JSX; components follow PascalCase, hooks use camelCase, and class names remain lowercase-kebab.
- Respect `prefers-reduced-motion`, keeping Framer Motion animations subtle (short fade/slide transitions) and providing fallbacks for reduced motion preferences.
- Maintain the light/dark theme toggle with animated sun/moon icons and ensure contrast targets accessibility best practices.
- Apply the `.font-kiya` (Patrick Hand) accent whenever “Kiya Rose” appears in UI copy.
- Keep the footer’s legal line consistent: dynamic current year, typographic © symbol, `.font-kiya` "Kiya Rose", and the “Crafted with React, Tailwind CSS, and Firebase.” tag.
- Everything should be in Canadian English or French English when possible, when there are conflicting versions of a singular term use the more specific one. (For example cheque instead of check)

## Quality Expectations

- Prefer fixes that resolve lint warnings, TypeScript errors, and obvious UX problems rather than adding placeholders.
- When you touch code, scan the surrounding logic for latent bugs or smells and address them when feasible.
- Align fixes with the guidance used by DeepSource, CodeFactor, and SonarQube: eliminate dead code, handle edge cases, simplify complex conditionals, and tighten null/undefined guards.
- Preserve Firebase secrets by loading them from environment configuration—never commit credentials or hard-coded API keys.
- Ensure licensing references match the BSD 3-Clause notice in the project root `LICENSE` (copyright © 2025, Kiya Rose).
- Honor existing lint rules (avoid inline arrow handlers in JSX, limit nesting by extracting helpers, etc.).

## Collaboration Notes

- Favor small, composable helper components over deeply nested JSX trees (see `SiteHeader`/`SiteFooter` in `App.tsx`).
- When making UI changes, consider drag-and-drop persistence, localStorage access, the `mailto:` contact workflow, and other side effects already established in the repo.
- Use the existing `isDeveloping` styling in the Skills section when introducing new abilities (dashed border for in-progress skills).
- Keep the fallback page (`public/index.html`) visually aligned with the main palette when adjusting colors.
- Run `npm run lint` and (when relevant) `npm run build`; clean up generated `dist/` outputs if you run the build locally.
- Keep the build label helper in `src/data/build.ts` intact: it persists a random prefix per build signature in `localStorage`, so only adjust it if that behaviour breaks, and retain the accent tooltip that explains the two segments.
