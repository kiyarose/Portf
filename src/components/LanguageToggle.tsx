import { Icon } from "@iconify/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback } from "react";
import type { MouseEvent, KeyboardEvent } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { themedClass } from "../utils/themeClass";
import type { Language } from "../providers/language-context";
import SenyeraFlag from "../assets/Senyera.png";

const languages: {
  code: Language;
  name: string;
  flag: string;
  customFlag?: string;
}[] = [
  { code: "en", name: "English", flag: "🇨🇦" },
  { code: "ca", name: "Català", flag: "🇪🇸", customFlag: SenyeraFlag },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  const toggleMenu = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const handleStopPropagation = useCallback(
    (e: MouseEvent) => e.stopPropagation(),
    [],
  );

  const handleLanguageSelect = useCallback(
    (langCode: Language) => {
      setLanguage(langCode);
      closeMenu();
    },
    [setLanguage, closeMenu],
  );

  // Handler factory to avoid inline arrow functions
  const createLanguageSelectHandler = useCallback(
    (langCode: Language) => () => {
      handleLanguageSelect(langCode);
    },
    [handleLanguageSelect],
  );

  // Keyboard handler for overlay
  const handleOverlayKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        closeMenu();
      }
    },
    [closeMenu],
  );

  const buttonSurface = themedClass(theme, "!bg-white/70", "!bg-slate-800/80");
  const panelSurface = themedClass(
    theme,
    "border-white/20 bg-white/90",
    "border-slate-700/60 bg-slate-900/90",
  );
  const itemHover = "hover:bg-accent/10 hover:text-accent";
  const textColor = themedClass(theme, "text-slate-600", "text-slate-300");

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggleMenu}
        className={cn(
          "chip !px-3 !py-1.5",
          buttonSurface,
          "shadow-card backdrop-blur",
          prefersReducedMotion ? "" : "hover:animate-shake",
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {currentLanguage.customFlag ? (
            <img
              src={currentLanguage.customFlag}
              alt={`${currentLanguage.name} flag`}
              className="h-5 w-5 rounded-sm object-cover"
              aria-hidden="true"
            />
          ) : (
            <span className="text-xl" aria-hidden="true">
              {currentLanguage.flag}
            </span>
          )}
          <span
            className={cn(
              "text-sm font-medium uppercase tracking-wide",
              textColor,
            )}
          >
            {currentLanguage.code.toUpperCase()}
          </span>
          <Icon
            icon={
              isOpen
                ? "material-symbols:arrow-drop-up-rounded"
                : "material-symbols:arrow-drop-down-rounded"
            }
            className="text-lg text-accent"
            aria-hidden="true"
          />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay for closing menu */}
            <div
              className="fixed inset-0 z-[45]"
              onClick={closeMenu}
              onKeyDown={handleOverlayKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Close language menu"
              style={{ pointerEvents: "auto" }}
            />
            {/* Dropdown Menu */}
            <motion.div
              className={cn(
                "absolute right-0 top-full z-[50] mt-2 min-w-[160px] rounded-2xl border p-2 shadow-2xl backdrop-blur-xl",
                panelSurface,
              )}
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, scale: 0.95, y: -10 }
              }
              animate={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, scale: 0.95, y: -10 }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={handleStopPropagation}
            >
              <ul className="flex flex-col space-y-1">
                {languages.map((lang) => {
                  const handleClick = createLanguageSelectHandler(lang.code);
                  return (
                    <li key={lang.code}>
                      <button
                        type="button"
                        onClick={handleClick}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                          itemHover,
                          textColor,
                          lang.code === language && "bg-accent/10 text-accent",
                        )}
                      >
                        {lang.customFlag ? (
                          <img
                            src={lang.customFlag}
                            alt={`${lang.name} flag`}
                            className="h-5 w-5 rounded-sm object-cover"
                            aria-hidden="true"
                          />
                        ) : (
                          <span className="text-lg" aria-hidden="true">
                            {lang.flag}
                          </span>
                        )}
                        <span>{lang.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
