import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { themedClass } from "../utils/themeClass";

const SHOW_BACK_TO_TOP_OFFSET = 480;
const BOTTOM_PROXIMITY_OFFSET = 120;

interface ScrollSpySection {
  id: string;
  label: string;
}

interface ScrollSpyProps {
  sections: ScrollSpySection[];
}

export function ScrollSpy({ sections }: ScrollSpyProps) {
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeId = useScrollSpy(ids);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      setShowBackToTop(scrollY > SHOW_BACK_TO_TOP_OFFSET);
      setIsAtBottom(
        viewportHeight + scrollY >= scrollHeight - BOTTOM_PROXIMITY_OFFSET,
      );
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackToTop = useCallback((): void => {
    if (typeof window === "undefined") return;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  const buttonAnimate =
    isAtBottom && !prefersReducedMotion
      ? { opacity: 1, y: 0, rotate: [0, -6, 6, -6, 0], scale: [1, 1.08, 1] }
      : { opacity: 1, y: 0, rotate: 0, scale: 1 };

  const buttonTransition =
    isAtBottom && !prefersReducedMotion
      ? { duration: 0.9, repeat: Infinity, repeatDelay: 1.6 }
      : { duration: 0.2 };

  return (
    <>
      <nav
        aria-label="Section navigation"
        className="fixed right-4 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 md:right-6 md:flex"
      >
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "relative inline-flex h-6 w-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-accent transition",
              )}
              aria-label={`Jump to ${section.label}`}
            >
              <span
                className={cn(
                  "relative h-3 w-3 rounded-full transition",
                  isActive
                    ? themedClass(
                        theme,
                        "bg-accent shadow-[0_0_0_3px_rgba(148,163,184,0.25)]",
                        "bg-accent shadow-[0_0_0_3px_rgba(15,23,42,0.45)] ring-2 ring-white/60",
                      )
                    : themedClass(theme, "bg-slate-300/80", "bg-slate-400/60"),
                )}
              />
            </a>
          );
        })}

        {/* Back to Top Button - Desktop */}
        <motion.button
          type="button"
          onClick={handleBackToTop}
          initial={{ opacity: 0, y: 8 }}
          animate={
            showBackToTop
              ? buttonAnimate
              : { opacity: 0, y: 8, rotate: 0, scale: 0.9 }
          }
          whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          className={cn(
            "relative mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            themedClass(
              theme,
              "border-slate-300/60 bg-white/80 text-slate-600",
              "border-slate-700/60 bg-slate-900/70 text-slate-100",
            ),
            !showBackToTop && "pointer-events-none opacity-0",
            isAtBottom &&
              showBackToTop &&
              cn(
                "border-transparent",
                themedClass(
                  theme,
                  "bg-rose-500 text-white shadow-lg",
                  "bg-rose-400 text-white shadow-lg",
                ),
              ),
          )}
          transition={showBackToTop ? buttonTransition : { duration: 0.2 }}
          aria-label="Back to top"
        >
          <Icon
            icon="material-symbols:arrow-upward-rounded"
            className="text-xl"
          />
        </motion.button>
      </nav>

      {/* Mobile-only Back to Top Button */}
      <motion.button
        type="button"
        onClick={handleBackToTop}
        initial={{ opacity: 0, y: 8 }}
        animate={
          showBackToTop
            ? buttonAnimate
            : { opacity: 0, y: 8, rotate: 0, scale: 0.9 }
        }
        whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        className={cn(
          "fixed bottom-6 right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden",
          themedClass(
            theme,
            "border-slate-300/60 bg-white/80 text-slate-600",
            "border-slate-700/60 bg-slate-900/70 text-slate-100",
          ),
          !showBackToTop && "pointer-events-none opacity-0",
          isAtBottom &&
            showBackToTop &&
            cn(
              "border-transparent",
              themedClass(
                theme,
                "bg-rose-500 text-white shadow-xl",
                "bg-rose-400 text-white shadow-xl",
              ),
            ),
        )}
        transition={showBackToTop ? buttonTransition : { duration: 0.2 }}
        aria-label="Back to top"
      >
        <Icon
          icon="material-symbols:arrow-upward-rounded"
          className="text-xl"
        />
      </motion.button>
    </>
  );
}
