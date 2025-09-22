import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";
interface SectionHeaderProps {
  id: string;
  icon: string;
  label: string;
  eyebrow?: ReactNode;
}

export function SectionHeader({
  id,
  icon,
  label,
  eyebrow,
}: SectionHeaderProps) {
  const { theme } = useTheme();
  const eyebrowSurface = themedClass(theme, "!bg-accent/10", "!bg-accent/20");
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className={cn("chip !text-accent", eyebrowSurface)}>
        <Icon icon={icon} className="text-xl" aria-hidden="true" />
        <span className="font-medium">{eyebrow}</span>
      </span>
      <h2
        id={`${id}-title`}
        className="text-3xl font-semibold tracking-tight md:text-4xl"
      >
        {label}
      </h2>
    </div>
  );
}
