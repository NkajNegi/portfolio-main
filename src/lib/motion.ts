import type { Variants } from 'framer-motion'

/**
 * -----------------------------------------------------------------------------
 *  SHARED MOTION SYSTEM
 *  One source of truth for easing, durations and reveal variants so every
 *  section animates with the same rhythm. Import these instead of hand-tuning
 *  `initial`/`animate` props per component.
 *
 *  Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 *  in App.tsx — these variants don't need their own guards.
 * -----------------------------------------------------------------------------
 */

/** Expressive "gentle overshoot" ease used across the site. */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Standard durations (seconds). */
export const DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.9,
} as const

/** How far a reveal travels before settling, in px. */
export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

/** Maps a direction to its initial offset. */
export function directionOffset(direction: RevealDirection, distance: number) {
  switch (direction) {
    case 'up':
      return { y: distance }
    case 'down':
      return { y: -distance }
    case 'left':
      return { x: distance }
    case 'right':
      return { x: -distance }
    case 'none':
      return {}
  }
}

/** Simple fade-up, ready to use with `initial="hidden" animate/whileInView="visible"`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE } },
}

/** Parent container that staggers its <StaggerItem> children into view. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

/** Child item to pair with `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
}
