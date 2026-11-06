import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { LanguageContext, type Language } from "./language-context";
import { safeConsoleWarn } from "../utils/errorSanitizer";

const LANGUAGE_STORAGE_KEY = "kiya-language";

function getPreferredLanguage(): Language {
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(
      LANGUAGE_STORAGE_KEY,
    ) as Language | null;
    if (
      stored === "en" ||
      stored === "ca" ||
      stored === "fr" ||
      stored === "nl" ||
      stored === "ja" ||
      stored === "ru"
    ) {
      return stored;
    }
  } catch (error) {
    safeConsoleWarn("Failed to read language from localStorage", error);
  }

  // Try to detect browser language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ca")) return "ca";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("nl")) return "nl";
    if (browserLang.startsWith("ja")) return "ja";
    if (browserLang.startsWith("ru")) return "ru";
  }

  return "en";
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(() =>
    getPreferredLanguage(),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      safeConsoleWarn("Failed to save language to localStorage", error);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
