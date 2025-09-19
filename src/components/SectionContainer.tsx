import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
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
}>;

export function SectionContainer({
  id,
  className,
  children,
}: SectionContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView={prefersReducedMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={prefersReducedMotion ? undefined : variants}
      className={cn("scroll-mt-28", className)}
    >
      {children}
    </motion.section>
  );
}
