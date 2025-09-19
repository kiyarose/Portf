import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { educationTimeline } from "../data/education";
import { cn } from "../utils/cn";

export function EducationSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const activeItem = educationTimeline[activeIndex];

  const variants = useMemo(
    () => ({
      enter: { opacity: 0, y: 16 },
      center: { opacity: 1, y: 0 },
    }),
    [],
  );

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % educationTimeline.length);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (prev) =>
          (prev - 1 + educationTimeline.length) % educationTimeline.length,
      );
    }
  }, []);

  const assignFromDataset = useCallback(
    (target: EventTarget & { dataset?: DOMStringMap }) => {
      const raw = target.dataset?.index;
      if (raw == null) return;
      const next = Number(raw);
      if (!Number.isNaN(next)) {
        setActiveIndex(next);
      }
    },
    [],
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      assignFromDataset(event.currentTarget);
    },
    [assignFromDataset],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLButtonElement>) => {
      assignFromDataset(event.currentTarget);
    },
    [assignFromDataset],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      assignFromDataset(event.currentTarget);
    },
    [assignFromDataset],
  );

  const timelineItems = educationTimeline.map((item, index) => {
    const isActive = index === activeIndex;
    const optionId = `education-option-${index}`;
    return (
      <button
        key={item.school}
        id={optionId}
        type="button"
        role="option"
        aria-selected={isActive}
        className={cn(
          "relative flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-4 text-left transition dark:border-slate-700/60 dark:bg-slate-900/60",
          isActive && "border-accent/60 shadow-card shadow-accent/20",
        )}
        data-index={index}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onClick={handleClick}
      >
        <span
          className={cn(
            "absolute -left-[33px] hidden h-4 w-4 rounded-full border-4 border-white bg-slate-300 dark:border-slate-900 md:block",
            isActive && "bg-accent",
          )}
        />
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {item.dates}
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {item.school}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {item.program}
          </p>
        </div>
      </button>
    );
  });

  const activeOptionId = `education-option-${activeIndex}`;

  return (
    <SectionContainer id="education" className="pb-20">
      <EducationCard
        handleKeyDown={handleKeyDown}
        timelineItems={timelineItems}
        prefersReducedMotion={prefersReducedMotion}
        activeItem={activeItem}
        activeOptionId={activeOptionId}
        variants={variants}
      />
    </SectionContainer>
  );
}

type EducationCardProps = {
  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  timelineItems: ReactNode;
  prefersReducedMotion: boolean;
  activeItem: (typeof educationTimeline)[number];
  activeOptionId: string;
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
};

function EducationCard({
  handleKeyDown,
  timelineItems,
  prefersReducedMotion,
  activeItem,
  activeOptionId,
  variants,
}: EducationCardProps) {
  return (
    <div className="card-surface space-y-8">
      <SectionHeader
        id="education"
        icon="material-symbols:school-rounded"
        label="Education"
        eyebrow="Timeline"
      />

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <TimelineColumn
          handleKeyDown={handleKeyDown}
          timelineItems={timelineItems}
          activeOptionId={activeOptionId}
        />
        <DetailsCard
          prefersReducedMotion={prefersReducedMotion}
          activeItem={activeItem}
          variants={variants}
        />
      </div>
    </div>
  );
}

type TimelineColumnProps = {
  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  timelineItems: ReactNode;
  activeOptionId: string;
};

function TimelineColumn({ handleKeyDown, timelineItems, activeOptionId }: TimelineColumnProps) {
  return (
    <div className="relative flex flex-col gap-4 md:w-1/2">
      <span
        className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-0.5 bg-accent/30 md:block"
        aria-hidden="true"
      />
      <div
        className="space-y-4"
        onKeyDown={handleKeyDown}
        aria-label="Education timeline"
        role="listbox"
        aria-activedescendant={activeOptionId}
        tabIndex={0}
      >
        {timelineItems}
      </div>
    </div>
  );
}

type DetailsCardProps = {
  prefersReducedMotion: boolean;
  activeItem: (typeof educationTimeline)[number];
  variants: {
    enter: { opacity: number; y: number };
    center: { opacity: number; y: number };
  };
};

function DetailsCard({ prefersReducedMotion, activeItem, variants }: DetailsCardProps) {
  return (
    <div className="flex-1">
      <motion.div
        key={activeItem.school}
        initial={prefersReducedMotion ? false : "enter"}
        animate="center"
        variants={prefersReducedMotion ? undefined : variants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl bg-accent/10 p-6 text-slate-700 dark:bg-accent/15 dark:text-slate-200"
      >
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {activeItem.school}
        </h3>
        <p className="mt-2 text-base">{activeItem.program}</p>
        <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">
          {activeItem.dates}
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Use the arrow keys to explore the timeline and learn more about my academic journey.
        </p>
      </motion.div>
    </div>
  );
}
