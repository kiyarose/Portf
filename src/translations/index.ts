import type { Language } from "../providers/language-context";
import en from "./en.json";
import ca from "./ca.json";
import fr from "./fr.json";
import nl from "./nl.json";
import ja from "./ja.json";
import ru from "./ru.json";

export type TranslationKey = typeof en;

const translations: Record<Language, TranslationKey> = {
  en,
  ca,
  fr,
  nl,
  ja,
  ru,
};

export function getTranslations(language: Language): TranslationKey {
  return translations[language] || translations.en;
}

export { translations };
