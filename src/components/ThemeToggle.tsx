import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const variants = useMemo(
    () => ({
      light: { rotate: prefersReducedMotion ? 0 : 360, scale: 1 },
      dark: { rotate: prefersReducedMotion ? 0 : -360, scale: 1 },
    }),
    [prefersReducedMotion],
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "chip !bg-white/70 !px-3 !py-1.5 dark:!bg-slate-800/80",
        "shadow-card backdrop-blur",
        className,
      )}
      aria-label="Toggle light or dark theme"
    >
      <motion.span
        animate={theme}
        variants={variants}
        transition={{
          type: "spring",
          duration: prefersReducedMotion ? 0 : 0.9,
        }}
        className="flex items-center gap-2"
      >
        <Icon
          icon={
            theme === "light"
              ? "material-symbols:dark-mode-rounded"
              : "material-symbols:light-mode-rounded"
          }
          className="text-xl text-accent"
          aria-hidden="true"
        />
        <span className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {theme === "light" ? "Dark" : "Light"} mode
        </span>
      </motion.span>
    </button>
  );
}
