import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { experienceTimeline } from "../data/experience";

export function ExperienceSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const variants = useMemo(
    () => ({
      enter: { opacity: 0, y: 16 },
      center: { opacity: 1, y: 0 },
    }),
    [],
  );

  const handleIndexChange = useCallback((next: number) => {
    if (!Number.isNaN(next)) {
      setActiveIndex(next);
    }
  }, []);

  return (
    <SectionContainer id="experience" className="pb-20">
      <ExperienceCard
        options={experienceTimeline}
        activeIndex={activeIndex}
        onChange={handleIndexChange}
        prefersReducedMotion={prefersReducedMotion}
        variants={variants}
      />
    </SectionContainer>
  );
}

type ExperienceCardProps = {
  options: typeof experienceTimeline;
  activeIndex: number;
  onChange: (index: number) => void;
  prefersReducedMotion: boolean;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
};
function ExperienceCard({
  options,
  activeIndex,
  onChange,
  prefersReducedMotion,
  variants,
}: ExperienceCardProps) {
  const activeItem = options[activeIndex];

  return (
    <div className="card-surface space-y-8">
      <SectionHeader
        id="experience"
        icon="material-symbols:work-rounded"
        label="Experience"
        eyebrow="Timeline"
      />

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <TimelineColumn
          options={options}
          activeIndex={activeIndex}
          onChange={onChange}
        />
        <DetailsCard
          entry={activeItem}
          prefersReducedMotion={prefersReducedMotion}
          variants={variants}
        />
      </div>
    </div>
  );
}

type TimelineColumnProps = {
  options: typeof experienceTimeline;
  activeIndex: number;
  onChange: (index: number) => void;
};

function TimelineColumn({
  options,
  activeIndex,
  onChange,
}: TimelineColumnProps) {
  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <select
        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-base focus:outline-accent font-semibold"
        value={activeIndex}
        onChange={e => onChange(Number(e.target.value))}
        aria-label="Select experience entry"
      >
        {options.map((entry, idx) => (
          <option key={entry.company + entry.role} value={idx}>
            {entry.company}
          </option>
        ))}
      </select>
      <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-4 mt-2">
        {options.map((entry, idx) => (
          <li key={entry.company + entry.role} className="mb-6 ml-2">
            <span
              className={`absolute -left-4 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                idx === activeIndex
                  ? "border-accent bg-accent"
                  : "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
              }`}
              aria-current={idx === activeIndex ? "step" : undefined}
            />
            <button
              className={`text-left font-semibold transition-colors ${
                idx === activeIndex
                  ? "text-accent"
                  : "text-slate-700 dark:text-slate-300 hover:text-accent"
              }`}
              onClick={() => onChange(idx)}
              aria-label={`View experience at ${entry.company}`}
            >
              {entry.company}
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {entry.dates}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

type DetailsCardProps = {
  entry: (typeof experienceTimeline)[number];
  prefersReducedMotion: boolean;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
};

function DetailsCard({
  entry,
  prefersReducedMotion,
  variants,
}: DetailsCardProps) {
  return (
    <motion.div
      key={entry.company + entry.role}
      initial={prefersReducedMotion ? false : "enter"}
      animate="center"
      variants={variants}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 min-w-0"
    >
      <div className="mb-2 text-lg font-bold text-accent">{entry.role}</div>
      <div className="mb-1 text-base font-semibold text-slate-800 dark:text-slate-100">
        {entry.company}
      </div>
      <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">
        {entry.dates}
      </div>
      {entry.tech && entry.tech.length > 0 && (
        <div className="mb-2">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.tech.map((item) => {
              // Link to skills section if the skill matches a main skill
              const mainSkills = [
                "Information Technology Skills",
                "Customer Service",
                "Gaining Med Admin skills",
              ];
              const normalized = item.toLowerCase();
              const match = mainSkills.find(
                (s) =>
                  s.toLowerCase().includes(normalized) ||
                  normalized.includes(s.toLowerCase()),
              );
              return match ? (
                <a
                  key={item}
                  href="#skills"
                  className="chip !bg-accent/20 !px-3 !py-1 text-xs font-medium text-accent underline-offset-2 hover:underline dark:!bg-accent/30"
                  title={`See more about ${match}`}
                >
                  {item}
                </a>
              ) : (
                <span
                  key={item}
                  className="chip !bg-slate-100/80 !px-3 !py-1 text-xs font-medium text-slate-600 dark:!bg-slate-800/80 dark:text-slate-200"
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {entry.description && (
        <div className="text-base text-slate-700 dark:text-slate-300">
          {entry.description}
        </div>
      )}
    </motion.div>
  );
}
