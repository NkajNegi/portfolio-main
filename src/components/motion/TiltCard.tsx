import {
  type HTMLMotionProps,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { type ReactNode, useEffect, useState } from 'react'

// Override framer's `children` (which permits MotionValues) with a plain
// ReactNode so `{children}` type-checks as a normal JSX child.
type TiltCardProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children?: ReactNode
  /** Max rotation in degrees at the corners. */
  maxTilt?: number
  /** Scale applied while hovered. */
  cardScale?: number
  /** Whether to render the pointer-following glare highlight. */
  glare?: boolean
}

const SPRING = { stiffness: 150, damping: 18, mass: 0.4 }

/**
 * Pointer-tracking 3D tilt with an optional glare highlight — the tilt reads as
 * the card leaning toward the cursor, the glare as a reflection following it
 * (folding in a "spotlight card" for free).
 *
 * Self-contained: uses framer's `transformPerspective`, so no parent needs a
 * `perspective` — drop it in place of any card element. `...rest` is forwarded,
 * so entrance animations (whileInView), onClick, etc. still work.
 *
 * Guardrails:
 *  - Fine-pointer only (a hover device) — touch users get a plain card.
 *  - Reduced-motion → plain card, entrance intact, no tilt/glare.
 */
export function TiltCard({
  className,
  children,
  maxTilt = 7,
  cardScale = 1.03,
  glare = true,
  style,
  ...rest
}: TiltCardProps) {
  const reduce = useReducedMotion()
  const [fine, setFine] = useState(false)
  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine)').matches)
  }, [])

  const rotateX = useSpring(0, SPRING)
  const rotateY = useSpring(0, SPRING)
  const scale = useSpring(1, SPRING)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const glareOpacity = useSpring(0, SPRING)
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5), transparent 50%)`

  const enabled = !reduce && fine

  // `relative` is unconditional so the card's own absolutely-positioned children
  // (glow, watermark, glare) anchor to it in every branch — not just when tilt
  // is active.
  const mergedClass = `relative ${className ?? ''}`

  if (!enabled) {
    return (
      <motion.div className={mergedClass} style={style} {...rest}>
        {children}
      </motion.div>
    )
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width // 0..1
    const py = (e.clientY - r.top) / r.height
    rotateY.set((px - 0.5) * maxTilt * 2)
    rotateX.set(-(py - 0.5) * maxTilt * 2)
    scale.set(cardScale)
    glareX.set(px * 100)
    glareY.set(py * 100)
    glareOpacity.set(0.5)
  }

  const onPointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      className={mergedClass}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transformPerspective: 900,
        rotateX,
        rotateY,
        scale,
        ...style,
      }}
      {...rest}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
          style={{ background: glareBg, opacity: glareOpacity, mixBlendMode: 'soft-light' }}
        />
      )}
    </motion.div>
  )
}
