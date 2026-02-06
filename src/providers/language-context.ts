import { createContext } from "react";

export type Language = "en" | "ca" | "fr" | "nl" | "ja" | "ru";

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);
