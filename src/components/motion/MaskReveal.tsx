import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { EASE } from '@/lib/motion'

type MaskRevealProps = {
  children: ReactNode
  /** Seconds before the slide starts once in view. */
  delay?: number
  className?: string
}

/**
 * Masked slide-up reveal for headings: the text rises out of an invisible
 * "slot" (overflow-hidden) as it scrolls into view — a signature editorial
 * effect for big display type. Wrap the text content, not the heading tag:
 *
 *   <h2><MaskReveal>Selected Works.</MaskReveal></h2>
 *
 * The viewport observer lives on the OUTER mask (always visible) and drives
 * the inner span via variant propagation — observing the inner span directly
 * would never fire, since it starts clipped out of view by the mask itself.
 */
export function MaskReveal({ children, delay = 0, className }: MaskRevealProps) {
  // Reduced-motion users get the final, fully-visible text with no slide and no
  // clipping mask — never gate heading content behind a transform.
  const reduce = useReducedMotion()
  if (reduce) {
    return <span className={`inline-block ${className ?? ''}`}>{children}</span>
  }

  return (
    // Padding + negative margin keep descenders (g, p, y) from being clipped
    // by the overflow mask while adding no visual offset at rest.
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      className={`inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom ${className ?? ''}`}
    >
      <motion.span
        variants={{
          hidden: { y: '110%' },
          visible: { y: 0, transition: { duration: 0.8, ease: EASE, delay } },
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </motion.span>
  )
}
