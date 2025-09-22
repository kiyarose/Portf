import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../utils/cn";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";

interface SocialChipProps {
  href: string;
  label: string;
  icon: string;
}

export function SocialChip({ href, label, icon }: SocialChipProps) {
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const labelColor = themedClass(
    theme,
    "text-slate-700",
    "text-slate-200",
  );

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("chip group")}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
    >
      <Icon icon={icon} className="text-lg text-accent" aria-hidden="true" />
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-200 group-hover:text-accent",
          labelColor,
        )}
      >
        {label}
      </span>
    </motion.a>
  );
}
