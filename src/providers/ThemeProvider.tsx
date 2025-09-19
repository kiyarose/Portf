import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { ThemeContext, type Theme } from "./theme-context";

const THEME_STORAGE_KEY = "kiya-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch (error) {
    console.warn(`Failed to read localStorage key "${THEME_STORAGE_KEY}"`, error);
  }
  
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn(`Failed to write localStorage key "${THEME_STORAGE_KEY}"`, error);
    }
  }, [theme]);

  function registerMediaPreferenceListener() {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => {
      media.removeEventListener("change", handler);
    };
  }

  useEffect(registerMediaPreferenceListener, []);

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
