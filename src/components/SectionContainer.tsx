import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { useHydrated } from "../hooks/useHydrated";
import { cn } from "../utils/cn";

const variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

type SectionContainerProps = PropsWithChildren<{
  id: string;
  className?: string;
  debugAttributes?: Record<string, string>;
}>;

export function SectionContainer({
  id,
  className,
  children,
  debugAttributes,
}: SectionContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const animateOnView = hydrated && !prefersReducedMotion;

  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      initial={animateOnView ? "hidden" : false}
      whileInView={animateOnView ? "visible" : undefined}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={animateOnView ? variants : undefined}
      className={cn("scroll-mt-28", className)}
      {...(debugAttributes ?? {})}
    >
      {children}
    </motion.section>
  );
}
