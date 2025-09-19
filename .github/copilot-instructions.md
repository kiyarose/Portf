# Copilot Instructions

## Style & Architecture

- Keep the interface sleek and minimal with rounded Material-style cards, soft shadows, and translucent layers when depth is needed.
- Use rounded Material Symbols for navigation, section headers, and social chips so iconography stays cohesive.
- Compose Tailwind utility classes directly in JSX; components follow PascalCase, hooks use camelCase, and class names remain lowercase-kebab.
- Respect `prefers-reduced-motion`, keeping Framer Motion animations subtle and providing fallbacks for reduced motion preferences.
- Maintain the light/dark theme toggle with animated sun/moon icons and ensure contrast targets accessibility best practices.

## Quality Expectations

- Prefer fixes that resolve lint warnings, TypeScript errors, and obvious UX problems rather than adding placeholders.
- When you touch code, scan the surrounding logic for latent bugs or smells and address them when feasible.
- Align fixes with the guidance used by DeepSource, CodeFactor, and SonarQube: eliminate dead code, handle edge cases, simplify complex conditionals, and tighten null/undefined guards.
- Preserve Firebase secrets by loading them from environment configuration—never commit credentials or hard-coded API keys.

## Collaboration Notes

- Favor small, composable helper components over deeply nested JSX trees.
- When making UI changes, consider drag-and-drop persistence, localStorage access, and other side effects already established in the repo.
- Run `npm run lint` and `npm run build` after significant edits and keep the tree warning-free.
