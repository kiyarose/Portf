import type { Theme } from "../providers/theme-context";
import { safeConsoleWarn } from "../utils/errorSanitizer";

/** Rename if you fork the template to avoid colliding with other apps. */
export const THEME_STORAGE_KEY = "template-theme";
export const USER_PREFERENCE_KEY = "template-theme-user-set";

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    const stored = window.localStorage.getItem(
      THEME_STORAGE_KEY,
    ) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch (error) {
    safeConsoleWarn("Failed to read theme from localStorage", error);
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function hasUserSetTheme(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(USER_PREFERENCE_KEY) === "true";
  } catch (error) {
    safeConsoleWarn("Failed to read user preference from localStorage", error);
    return false;
  }
}
