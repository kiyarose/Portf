import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
interface SectionHeaderProps {
  id: string
  icon: string
  label: string
  eyebrow?: ReactNode
}

export function SectionHeader({ id, icon, label, eyebrow }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="chip !bg-accent/10 !text-accent dark:!bg-accent/20">
        <Icon icon={icon} className="text-xl" aria-hidden="true" />
        <span className="font-medium">{eyebrow}</span>
      </span>
      <h2 id={`${id}-title`} className="text-3xl font-semibold tracking-tight md:text-4xl">
        {label}
      </h2>
    </div>
  )
}
