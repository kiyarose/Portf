import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../hooks/useTranslation";
import { cn } from "../utils/cn";
import { themedClass } from "../utils/themeClass";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "chip !px-3 !py-1.5",
        themedClass(theme, "!bg-white/70", "!bg-slate-800/80"),
        "shadow-card backdrop-blur",
        prefersReducedMotion ? "" : "hover:animate-shake",
        className,
      )}
      aria-label="Toggle light or dark theme"
    >
      <motion.span
        key={theme}
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: -6, scale: 0.95 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.25,
          ease: "easeOut",
        }}
        className="flex items-center gap-2"
      >
        <Icon
          icon={
            isLight
              ? "material-symbols:dark-mode-rounded"
              : "material-symbols:light-mode-rounded"
          }
          className="text-xl text-accent"
          aria-hidden="true"
        />
        <span
          className={cn(
            "text-sm font-medium uppercase tracking-wide",
            themedClass(theme, "text-slate-600", "text-slate-300"),
          )}
        >
          {isLight ? t.theme.darkMode : t.theme.lightMode}
        </span>
      </motion.span>
    </button>
  );
}
