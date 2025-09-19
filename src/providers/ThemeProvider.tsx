import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { ThemeContext, type Theme } from "./theme-context";

const THEME_STORAGE_KEY = "kiya-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    function cleanupMediaListener() {
      media.removeEventListener("change", handler);
    }
    return cleanupMediaListener;
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
