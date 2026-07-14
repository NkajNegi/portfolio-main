import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[150] h-1 origin-left bg-gradient-to-r from-violet-500 via-cyan-400 to-rose-400"
      aria-hidden="true"
    />
  )
}
