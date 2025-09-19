import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionContainer } from '../components/SectionContainer'
import { SectionHeader } from '../components/SectionHeader'
import { defaultSkills } from '../data/skills'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { cn } from '../utils/cn'

function SortableSkill({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
      className={cn(
        'select-none rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-slate-700 shadow-md dark:bg-slate-800/70 dark:text-slate-200',
        isDragging && 'ring-2 ring-accent'
      )}
    >
      {label}
    </motion.li>
  )
}

export function SkillsSection() {
  const [skills, setSkills] = useLocalStorage<string[]>('kiya-skills-order', [...defaultSkills])
  const prefersReducedMotion = useReducedMotion()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSkills((current) => {
      const oldIndex = current.indexOf(active.id as string)
      const newIndex = current.indexOf(over.id as string)
      if (oldIndex === -1 || newIndex === -1) return current
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  return (
    <SectionContainer id="skills" className="pb-20">
      <div className="card-surface space-y-8">
        <SectionHeader
          id="skills"
          icon="material-symbols:sparkles-rounded"
          label="Skills"
          eyebrow="Strengths"
        />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Drag to reorder the skills. Your layout stays saved locally so you can keep the focus on what matters for each conversation.
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={skills} strategy={horizontalListSortingStrategy}>
            <motion.ul
              layout
              className="flex flex-wrap gap-3"
              transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.05 }}
            >
              {skills.map((skill) => (
                <SortableSkill key={skill} id={skill} label={skill} />
              ))}
            </motion.ul>
          </SortableContext>
        </DndContext>
      </div>
    </SectionContainer>
  )
}
