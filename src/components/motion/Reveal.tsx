import { type HTMLMotionProps, motion } from 'framer-motion'

import { directionOffset, DURATION, EASE, type RevealDirection } from '@/lib/motion'

type RevealProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'whileInView'> & {
  /** Which way the element travels in from. Default: 'up'. */
  direction?: RevealDirection
  /** Travel distance in px. Default: 24. */
  distance?: number
  /** Delay before the reveal starts, in seconds. */
  delay?: number
  /** Reveal duration, in seconds. */
  duration?: number
  /** Only animate the first time it enters the viewport. Default: true. */
  once?: boolean
  /** Fraction of the element that must be visible to trigger. Default: 0.2. */
  amount?: number
}

/**
 * Drop-in wrapper that fades + slides its children into view on scroll.
 * Replaces the copy-pasted `motion.div` reveal blocks scattered across sections.
 *
 *   <Reveal direction="up" delay={0.1}>…</Reveal>
 */
export function Reveal({
  children,
  direction = 'up',
  distance = 24,
  delay = 0,
  duration = DURATION.base,
  once = true,
  amount = 0.2,
  ...rest
}: RevealProps) {
  const offset = directionOffset(direction, distance)

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
