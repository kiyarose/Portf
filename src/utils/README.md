# `src/utils/` guide

Utility modules used across the app:

- `navigation.ts` - base-path-safe navigation helpers
- `errorSanitizer.ts` - safe error output and generic user-facing messages
- `themeClass.ts` - light/dark class switching helper
- `cn.ts` - class merge helper (`clsx` + `tailwind-merge`)
- `icons.ts` - icon registration helpers
- `confetti.ts`, `getCspNonce.ts` - focused utility helpers

Keep utility modules small, focused, and side-effect free where possible.
