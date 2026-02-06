import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import {
  EDUCATION_RESOURCE,
  educationFallback,
  educationPlaceholder,
  type EducationEntry,
} from "../data/education";
import { getSkillIcon } from "../data/skills";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../hooks/useTranslation";
import { useRemoteData } from "../hooks/useRemoteData";
import type { Theme } from "../providers/theme-context";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

export function EducationSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: educationEntries, debugAttributes: educationDebugAttributes } =
    useRemoteData<EducationEntry[]>({
      resource: EDUCATION_RESOURCE,
      fallbackData: educationFallback,
      placeholderData: educationPlaceholder,
    });

  const variants = useMemo(
    () => ({
      enter: { opacity: 0, y: 16 },
      center: { opacity: 1, y: 0 },
    }),
    [],
  );

  // Clamp activeIndex when educationEntries change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setActiveIndex((current) => {
      if (educationEntries.length === 0) {
        return 0;
      }
      return Math.min(current, educationEntries.length - 1);
    });
  }, [educationEntries]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSelectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const next = Number(event.target.value);
      if (!Number.isNaN(next)) {
        setActiveIndex(next);
      }
    },
    [],
  );

  return (
    <SectionContainer
      id="education"
      className="pb-20"
      debugAttributes={educationDebugAttributes}
    >
      <EducationCard
        options={educationEntries}
        activeIndex={activeIndex}
        onChange={handleSelectChange}
        prefersReducedMotion={prefersReducedMotion}
        variants={variants}
        theme={theme}
        t={t}
      />
    </SectionContainer>
  );
}

type EducationCardProps = {
  options: EducationEntry[];
  activeIndex: number;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  prefersReducedMotion: boolean;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
  theme: Theme;
  t: ReturnType<typeof useTranslation>["t"];
};

function EducationCard({
  options,
  activeIndex,
  onChange,
  prefersReducedMotion,
  variants,
  theme,
  t,
}: EducationCardProps) {
  const safeEntry =
    options.length > 0
      ? options[Math.min(activeIndex, options.length - 1)]
      : educationPlaceholder[0];

  if (!safeEntry) {
    return null;
  }

  const activeItem = safeEntry;

  return (
    <div className="card-surface space-y-8">
      <SectionHeader
        id="education"
        icon="material-symbols:school-rounded"
        label={t.education.title}
        eyebrow={t.education.eyebrow}
      />

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <TimelineColumn
          options={options}
          activeIndex={activeIndex}
          onChange={onChange}
          theme={theme}
        />
        <DetailsCard
          entry={activeItem}
          prefersReducedMotion={prefersReducedMotion}
          variants={variants}
          theme={theme}
        />
      </div>
    </div>
  );
}

type TimelineColumnProps = {
  options: EducationEntry[];
  activeIndex: number;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  theme: Theme;
};

function TimelineColumn({
  options,
  activeIndex,
  onChange,
  theme,
}: TimelineColumnProps) {
  const selectSize = Math.min(Math.max(options.length, 3), 6);
  const labelColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const helperColor = themedClass(theme, "text-slate-500", "text-slate-400");

  return (
    <div className="relative flex flex-col gap-3 md:w-1/2">
      <span
        className="pointer-events-none absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-0.5 bg-accent/30 md:block"
        aria-hidden="true"
      />
      <label className={cn("block text-sm font-medium", labelColor)}>
        <span className="sr-only">Education timeline entries</span>
        <select
          className={cn(
            "mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/60",
            themedClass(
              theme,
              "border-slate-200/60 bg-white/95 text-slate-700",
              "border-slate-700/60 bg-slate-900/70 text-slate-200",
            ),
          )}
          size={selectSize}
          value={activeIndex}
          onChange={onChange}
          aria-label="Education entries"
        >
          {options.map((entry, index) => (
            <option key={entry.school} value={index}>
              {`${entry.school} — ${entry.dates}`}
            </option>
          ))}
        </select>
      </label>
      <p className={cn("text-xs", helperColor)}>
        These studies have boosted my networking foundations, customer-first
        support skills, and upcoming training in medical coding best practices.
      </p>
    </div>
  );
}

type DetailsCardProps = {
  entry: EducationEntry;
  prefersReducedMotion: boolean;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
  theme: Theme;
};

function DetailsCard({
  entry,
  prefersReducedMotion,
  variants,
  theme,
}: DetailsCardProps) {
  const containerSurface = themedClass(
    theme,
    "bg-accent/10 text-slate-700",
    "bg-accent/15 text-slate-200",
  );
  const headingColor = themedClass(theme, "text-slate-900", "text-white");
  const metaColor = themedClass(theme, "text-slate-500", "text-slate-300");
  const chipColor = themedClass(
    theme,
    "!bg-slate-100/80 text-slate-600",
    "!bg-slate-800/80 text-slate-200",
  );
  const focusChipClass = cn(
    "chip flex items-center gap-2 !px-3 !py-1 text-xs font-medium",
    chipColor,
  );
  const captionColor = themedClass(theme, "text-slate-600", "text-slate-300");
  return (
    <div className="flex-1">
      <motion.div
        key={entry.school}
        initial={prefersReducedMotion ? false : "enter"}
        animate="center"
        variants={prefersReducedMotion ? undefined : variants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("rounded-2xl p-6", containerSurface)}
      >
        <h3 className={cn("text-2xl font-semibold", headingColor)}>
          {entry.school}
        </h3>
        <p className="mt-2 text-base">{entry.program}</p>
        <p
          className={cn(
            "mt-4 text-sm font-medium uppercase tracking-wide",
            metaColor,
          )}
        >
          {entry.dates}
        </p>
        {entry.tech && entry.tech.length > 0 && (
          <div className="mt-4">
            <div
              className={cn(
                "mb-1 text-xs font-semibold uppercase tracking-wide",
                metaColor,
              )}
            >
              Focus
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.tech.map((item) => {
                const iconName = getSkillIcon(item);

                return (
                  <span key={item} className={focusChipClass}>
                    {iconName ? (
                      <Icon
                        icon={iconName}
                        className="text-sm"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span>{item}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <p className={cn("mt-4 text-sm", captionColor)}>
          Use the selector to review different programmes taken.
        </p>
      </motion.div>
    </div>
  );
}
