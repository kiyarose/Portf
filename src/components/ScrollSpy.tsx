import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { cn } from "../utils/cn";

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      setShowBackToTop(scrollY > SHOW_BACK_TO_TOP_OFFSET);
      setIsAtBottom(viewportHeight + scrollY >= scrollHeight - BOTTOM_PROXIMITY_OFFSET);
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
  }

  const buttonAnimate =
    isAtBottom && !prefersReducedMotion
      ? { opacity: 1, y: 0, rotate: [0, -6, 6, -6, 0], scale: [1, 1.08, 1] }
      : { opacity: 1, y: 0, rotate: 0, scale: 1 };

  const buttonTransition =
    isAtBottom && !prefersReducedMotion
      ? { duration: 0.9, repeat: Infinity, repeatDelay: 1.6 }
      : { duration: 0.2 };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
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
                "relative h-3 w-3 rounded-full bg-slate-300/60 transition",
                isActive && "bg-accent",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="scroll-indicator"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </span>
          </a>
        );
      })}
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
          "relative mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/60 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100",
          !showBackToTop && "pointer-events-none opacity-0",
          isAtBottom &&
            showBackToTop &&
            "border-transparent bg-rose-500 text-white shadow-lg",
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
  );
}
