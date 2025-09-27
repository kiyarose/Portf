import { motion, useReducedMotion } from "framer-motion";
import { themedClass } from "../utils/themeClass";
import type { Theme } from "../providers/theme-context";

export function DecorativeBackground({ theme }: { theme: Theme }) {
  const prefersReducedMotion = useReducedMotion();
  const topGlowClass = themedClass(theme, "bg-orange-400/30", "bg-accent/30");
  const bottomGlowClass = themedClass(
    theme,
    "bg-rose-400/20",
    "bg-indigo-500/20",
  );

  return (
    <>
      <motion.div
        className={`pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[520px] w-[520px] rounded-full blur-3xl ${topGlowClass}`}
        animate={
          prefersReducedMotion ? undefined : { opacity: [0.35, 0.6, 0.35] }
        }
        transition={{
          repeat: prefersReducedMotion ? 0 : Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`pointer-events-none absolute bottom-10 left-[10%] h-64 w-64 rounded-full blur-3xl ${bottomGlowClass}`}
        animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
        transition={{
          repeat: prefersReducedMotion ? 0 : Infinity,
          duration: 12,
          ease: "easeInOut",
        }}
      />
    </>
  );
}
