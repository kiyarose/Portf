import { Icon } from '@iconify/react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils/cn'

interface SocialChipProps {
  href: string
  label: string
  icon: string
}

export function SocialChip({ href, label, icon }: SocialChipProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('chip group')}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
    >
      <Icon icon={icon} className="text-lg text-accent" aria-hidden="true" />
      <span className="text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-accent dark:text-slate-200">
        {label}
      </span>
    </motion.a>
  )
}
