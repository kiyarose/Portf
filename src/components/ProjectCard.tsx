import { Icon } from "@iconify/react";
import { useReducedMotion } from "framer-motion";
import type { Project } from "../data/projects";
import { getSkillIcon } from "../data/skills";
import { cn } from "../utils/cn";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const techChipClass = cn(
    "chip flex items-center gap-2 !px-3 !py-1 text-xs font-medium",
    themedClass(
      theme,
      "!bg-slate-100/80 text-slate-600",
      "!bg-slate-800/80 text-slate-200",
    ),
  );

  return (
    <div
      className={cn(
        "card-surface h-full space-y-4 border",
        themedClass(theme, "border-white/30", "border-slate-700/60"),
        prefersReducedMotion
          ? "transition-colors"
          : "transform-gpu transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3
          className={cn(
            "text-lg font-semibold sm:text-xl",
            themedClass(theme, "text-slate-900", "text-slate-100"),
          )}
        >
          {project.title}
        </h3>
        <span className="self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent sm:px-4">
          Hobby Build
        </span>
      </div>
      <p
        className={cn(
          "text-sm",
          themedClass(theme, "text-slate-600", "text-slate-300"),
        )}
      >
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((item) => {
          const iconName = getSkillIcon(item);

          return (
            <span key={item} className={techChipClass}>
              {iconName ? (
                <Icon icon={iconName} className="text-sm" aria-hidden="true" />
              ) : null}
              <span>{item}</span>
            </span>
          );
        })}
      </div>
      {project.link ? (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent"
        >
          <span>View project</span>
          <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </div>
  );
}
