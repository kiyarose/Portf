import { Icon } from "@iconify/react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { Project } from "../data/projects";
import { cn } from "../utils/cn";
import { skillIcons } from "../utils/icons";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 12 });
  const springY = useSpring(y, { stiffness: 150, damping: 12 });

  const rotateX = useTransform(springY, [-30, 30], [8, -8]);
  const rotateY = useTransform(springX, [-30, 30], [-8, 8]);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const { left, top, width, height } =
        event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - left;
      const offsetY = event.clientY - top;
      const centerX = width / 2;
      const centerY = height / 2;
      x.set(((offsetX - centerX) / centerX) * 30);
      y.set(((offsetY - centerY) / centerY) * 30);
    },
    [prefersReducedMotion, x, y],
  );

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  }, [prefersReducedMotion, x, y]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "card-surface h-full space-y-4 border border-white/30 dark:border-slate-700/60",
      )}
      style={prefersReducedMotion ? undefined : { rotateX, rotateY }}
      whileHover={prefersReducedMotion ? undefined : { translateY: -6 }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
          {project.title}
        </h3>
        <span className="self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent sm:px-4">
          Hobby Build
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((item) => (
          <span
            key={item}
            className="chip flex items-center gap-2 !bg-slate-100/80 !px-3 !py-1 text-xs font-medium text-slate-600 dark:!bg-slate-800/80 dark:text-slate-200"
          >
            {skillIcons[item] && (
              <Icon
                icon={skillIcons[item]}
                className="text-sm"
                aria-hidden="true"
              />
            )}
            {item}
          </span>
        ))}
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
    </motion.div>
  );
}
