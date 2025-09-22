import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { ThemeContext, type Theme } from "./theme-context";
import { safeConsoleWarn } from "../utils/errorSanitizer";

const THEME_STORAGE_KEY = "kiya-theme";
const USER_PREFERENCE_KEY = "kiya-theme-user-set";

function getPreferredTheme(): Theme {
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

function hasUserSetTheme(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    return window.localStorage.getItem(USER_PREFERENCE_KEY) === "true";
  } catch (error) {
    safeConsoleWarn("Failed to read user preference from localStorage", error);
    return false;
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());
  const [userHasSetTheme, setUserHasSetTheme] = useState<boolean>(() => hasUserSetTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (userHasSetTheme) {
        window.localStorage.setItem(USER_PREFERENCE_KEY, "true");
      }
    } catch (error) {
      safeConsoleWarn("Failed to save theme to localStorage", error);
    }
  }, [theme, userHasSetTheme]);

  function registerMediaPreferenceListener() {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      // Only auto-switch themes if user hasn't manually set a preference
      if (!userHasSetTheme) {
        setTheme(event.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", handler);
    return () => {
      media.removeEventListener("change", handler);
    };
  }

  useEffect(registerMediaPreferenceListener, [userHasSetTheme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setUserHasSetTheme(true);
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
