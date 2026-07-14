import { motion, useReducedMotion, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'

type MagneticProps = {
  children: ReactNode
  /** How strongly the element follows the cursor (0–1). Default: 0.35. */
  strength?: number
  className?: string
}

/**
 * Makes its child subtly follow the cursor while hovered, springing back to
 * rest on leave. Pointer-only by design — touch devices and reduced-motion
 * users get a static element.
 */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const spring = { stiffness: 200, damping: 15, mass: 0.2 }
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)

  function handleMouseMove(e: React.MouseEvent) {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
