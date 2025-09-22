import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback } from "react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { defaultSkills } from "../data/skills";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";
import { themedClass } from "../utils/themeClass";

function SortableSkill({
  id,
  label,
  isDeveloping,
}: {
  id: string;
  label: string;
  isDeveloping?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { theme } = useTheme();
  const surfaceClass = themedClass(
    theme,
    "bg-white/80 text-slate-700",
    "bg-slate-800/70 text-slate-200",
  );
  const developingClass = themedClass(
    theme,
    "border-2 border-dashed border-accent/60 bg-accent/10 text-accent",
    "border-2 border-dashed border-accent/60 bg-accent/20 text-accent",
  );
  const stableBorderClass = themedClass(
    theme,
    "border border-slate-200/60",
    "border border-slate-700/60",
  );

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      className={cn(
        "select-none rounded-full px-5 py-2 text-sm font-medium shadow-md transition-colors",
        surfaceClass,
        isDeveloping ? developingClass : stableBorderClass,
        isDragging && "ring-2 ring-accent",
      )}
    >
      {label}
    </motion.li>
  );
}

type SkillsBoardProps = {
  skills: string[];
  prefersReducedMotion: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
};

function SkillsBoard({
  skills,
  prefersReducedMotion,
  sensors,
  onDragEnd,
}: SkillsBoardProps) {
  const developingSkills = new Set(["Gaining Med Admin skills"]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={skills} strategy={horizontalListSortingStrategy}>
        <motion.ul
          layout
          className="flex flex-wrap gap-3"
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.05 }}
        >
          {skills.map((skill) => (
            <SortableSkill
              key={skill}
              id={skill}
              label={skill}
              isDeveloping={developingSkills.has(skill)}
            />
          ))}
        </motion.ul>
      </SortableContext>
    </DndContext>
  );
}

export function SkillsSection() {
  const [skills, setSkills] = useLocalStorage<string[]>("kiya-skills-order", [
    ...defaultSkills,
  ]);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setSkills((current) => {
        const oldIndex = current.indexOf(active.id as string);
        const newIndex = current.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return current;
        return arrayMove(current, oldIndex, newIndex);
      });
    },
    [setSkills],
  );

  return (
    <SectionContainer id="skills" className="pb-20">
      <div className="card-surface space-y-8">
        <SectionHeader
          id="skills"
          icon="material-symbols:auto-awesome-rounded"
          label="Skills"
          eyebrow="Strengths"
        />
        <SkillsBoard
          skills={skills}
          prefersReducedMotion={prefersReducedMotion}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        />
      </div>
    </SectionContainer>
  );
}
