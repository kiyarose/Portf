import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
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
    <SectionContainer id="experience" className="pb-20">
      <ExperienceCard
        options={experienceTimeline}
        activeIndex={activeIndex}
        onChange={handleSelectChange}
        prefersReducedMotion={prefersReducedMotion}
        variants={variants}
      />
    </SectionContainer>
  );
}

type ExperienceCardProps = {
  options: typeof experienceTimeline;
  activeIndex: number;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
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
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

function TimelineColumn({
  options,
  activeIndex,
  onChange,
}: TimelineColumnProps) {
  const selectSize = Math.min(Math.max(options.length, 3), 6);

  return (
    <div className="relative flex flex-col gap-3 md:w-1/2">
      <span
        className="pointer-events-none absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-0.5 bg-accent/30 md:block"
        aria-hidden="true"
      />
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="sr-only">Experience timeline entries</span>
        <select
          className="mt-1 w-full rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/60 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200"
          size={selectSize}
          value={activeIndex}
          onChange={onChange}
          aria-label="Experience entries"
        >
          {options.map((entry, index) => (
            <option key={entry.company} value={index}>
              {`${entry.company} — ${entry.dates}`}
            </option>
          ))}
        </select>
      </label>
      
      {/* Timeline buttons with problematic 'as any' usage */}
      <div className="flex flex-col gap-2">
        {options.map((entry, idx) => (
          <button
            key={entry.company}
            onClick={() => onChange({ target: { value: String(idx) } } as any)}
            className={`text-left rounded-lg px-3 py-2 text-sm transition ${
              idx === activeIndex
                ? "bg-accent/20 text-accent font-medium"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {entry.company}
          </button>
        ))}
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400">
        These experiences have developed my technical skills, problem-solving abilities, and professional communication.
      </p>
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
    <div className="flex-1">
      <motion.div
        key={entry.company}
        initial={prefersReducedMotion ? false : "enter"}
        animate="center"
        variants={prefersReducedMotion ? undefined : variants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl bg-accent/10 p-6 text-slate-700 dark:bg-accent/15 dark:text-slate-200"
      >
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {entry.company}
        </h3>
        <p className="mt-2 text-base font-medium text-accent">{entry.position}</p>
        <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">
          {entry.dates}
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {entry.description}
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Use the selector or buttons to review different positions held.
        </p>
      </motion.div>
    </div>
  );
}