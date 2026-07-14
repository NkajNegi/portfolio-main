import { type HTMLMotionProps, motion } from 'framer-motion'

import { directionOffset, DURATION, EASE, type RevealDirection } from '@/lib/motion'

type StaggerProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'whileInView' | 'variants'> & {
  /** Gap between each child's reveal, in seconds. Default: 0.08. */
  stagger?: number
  /** Delay before the first child reveals, in seconds. Default: 0.05. */
  delayChildren?: number
  once?: boolean
  amount?: number
}

/**
 * Container that reveals its <StaggerItem> children one after another as it
 * scrolls into view. Any non-StaggerItem children still render normally.
 *
 *   <Stagger className="grid gap-6">
 *     <StaggerItem>…</StaggerItem>
 *     <StaggerItem>…</StaggerItem>
 *   </Stagger>
 */
export function Stagger({
  children,
  stagger = 0.08,
  delayChildren = 0.05,
  once = true,
  amount = 0.2,
  ...rest
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = Omit<HTMLMotionProps<'div'>, 'variants'> & {
  direction?: RevealDirection
  distance?: number
}

/** Child of <Stagger>. Reveals on the parent's staggered timeline. */
export function StaggerItem({
  children,
  direction = 'up',
  distance = 20,
  ...rest
}: StaggerItemProps) {
  const offset = directionOffset(direction, distance)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offset },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
