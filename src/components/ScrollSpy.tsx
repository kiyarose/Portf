import { motion } from "framer-motion";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { cn } from "../utils/cn";

interface ScrollSpySection {
  id: string;
  label: string;
}

interface ScrollSpyProps {
  sections: ScrollSpySection[];
}

export function ScrollSpy({ sections }: ScrollSpyProps) {
  const activeId = useScrollSpy(sections.map((section) => section.id));

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex"
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
    </nav>
  );
}
