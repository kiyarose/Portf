import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { ThemeContext, type Theme } from "./theme-context";
import { safeConsoleWarn } from "../utils/errorSanitizer";
import {
  THEME_STORAGE_KEY,
  USER_PREFERENCE_KEY,
  getPreferredTheme,
  hasUserSetTheme,
} from "../theme/storage";

function applyTheme(theme: Theme, userHasSetTheme: boolean) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const body = document.body;
  const colorSchemes = theme === "dark" ? "dark light" : "light dark";

  // Snap both root and body into the requested theme so Tailwind's dark: variants
  // and UA-tinted controls switch immediately, even when OS preference differs.
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
  root.style.colorScheme = colorSchemes;

  if (body) {
    body.classList.remove("light", "dark");
    body.classList.add(theme);
  }

  const colorSchemeMeta = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (colorSchemeMeta) {
    colorSchemeMeta.content = colorSchemes;
  } else {
    const meta = document.createElement("meta");
    meta.name = "color-scheme";
    meta.content = colorSchemes;
    document.head.appendChild(meta);
  }

  if (!userHasSetTheme) {
    root.removeAttribute("data-user-theme");
  } else {
    root.dataset.userTheme = theme;
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());
  const [userHasSetTheme, setUserHasSetTheme] = useState<boolean>(() =>
    hasUserSetTheme(),
  );

  useLayoutEffect(() => {
    applyTheme(theme, userHasSetTheme);
  }, [theme, userHasSetTheme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (userHasSetTheme) {
        window.localStorage.setItem(USER_PREFERENCE_KEY, "true");
      } else {
        window.localStorage.removeItem(USER_PREFERENCE_KEY);
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
        setTheme((prev) => {
          const nextTheme: Theme = prev === "light" ? "dark" : "light";
          try {
            // Persist immediately so rapid reloads keep the user's choice.
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            window.localStorage.setItem(USER_PREFERENCE_KEY, "true");
          } catch (error) {
            safeConsoleWarn("Failed to save theme to localStorage", error);
          }
          return nextTheme;
        });
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
