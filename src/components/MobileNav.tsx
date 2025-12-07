import { Icon } from "@iconify/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback } from "react";
import type { MouseEvent } from "react";
import { useTheme } from "../hooks/useTheme";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

type Section = {
  id: string;
  label: string;
  icon: string;
};

interface MobileNavProps {
  sections: Section[];
}

export function MobileNav({ sections }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const buttonSurface = themedClass(theme, "bg-white/70", "bg-slate-900/70");
  const iconColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const panelSurface = themedClass(
    theme,
    "border-white/20 bg-white/90",
    "border-slate-700/60 bg-slate-900/90",
  );
  const linkColor = themedClass(theme, "text-slate-600", "text-slate-300");

  // Lock body scroll when menu is open
  useBodyScrollLock(isOpen);

  const toggleMenu = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const handleStopPropagation = useCallback(
    (e: MouseEvent) => e.stopPropagation(),
    [],
  );

  return (
    <div className="md:hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            onClick={closeMenu}
            style={{
              pointerEvents: "auto",
              WebkitBackdropFilter: "blur(24px)",
              backdropFilter: "blur(24px)",
              willChange: "backdrop-filter",
            }}
          >
            {/* Mobile Menu Panel */}
            <motion.nav
              className={cn(
                "absolute right-4 top-20 rounded-3xl border p-4 shadow-2xl backdrop-blur-xl",
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
              <ul className="flex flex-col space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={closeMenu}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-accent/10 hover:text-accent",
                        linkColor,
                      )}
                    >
                      <Icon
                        icon={section.icon}
                        className="text-lg"
                        aria-hidden="true"
                      />
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hamburger Menu Button - positioned above overlay with higher z-index */}
      <motion.button
        onClick={toggleMenu}
        className={cn(
          "relative z-[60] flex items-center justify-center rounded-full p-2 shadow-md backdrop-blur",
          buttonSurface,
        )}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <Icon
          icon={
            isOpen
              ? "material-symbols:close-rounded"
              : "material-symbols:menu-rounded"
          }
          className={cn("text-xl", iconColor)}
        />
      </motion.button>
    </div>
  );
}
