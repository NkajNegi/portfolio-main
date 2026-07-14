import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

import { EASE } from '@/lib/motion'

type CountUpProps = {
  /** Final value to count to. */
  value: number
  /** Animation length in seconds. */
  duration?: number
  className?: string
}

/**
 * Counts from 0 to `value` the first time it scrolls into view.
 * Reduced-motion users (and non-JS contexts) see the final number immediately.
 */
export function CountUp({ value, duration = 1.4, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || !ref.current) return
    if (reduceMotion) {
      ref.current.textContent = value.toLocaleString()
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString()
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, reduceMotion])

  // Start visually at 0 (the effect animates it up); reduced motion shows the
  // final value straight away.
  return (
    <span ref={ref} className={className}>
      {reduceMotion ? value.toLocaleString() : '0'}
    </span>
  )
}
