import { Icon } from "@iconify/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback } from "react";
import type { MouseEvent } from "react";

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

  const toggleMenu = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const handleStopPropagation = useCallback((e: MouseEvent) => e.stopPropagation(), []);

  return (
    <div className="md:hidden">
      {/* Hamburger Menu Button */}
      <motion.button
        onClick={toggleMenu}
        className="flex items-center justify-center rounded-full bg-white/70 p-2 shadow-md backdrop-blur dark:bg-slate-900/70"
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
          className="text-xl text-slate-600 dark:text-slate-300"
        />
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            onClick={closeMenu}
          >
            {/* Mobile Menu Panel */}
            <motion.nav
              className="absolute right-4 top-20 rounded-3xl border border-white/20 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90"
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
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-accent/10 hover:text-accent dark:text-slate-300"
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
    </div>
  );
}
