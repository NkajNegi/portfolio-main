import { animate, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { site } from '@/content/site'
import { EASE } from '@/lib/motion'

type PreloaderProps = {
  /** Called when the counter finishes and the curtain starts lifting. */
  onExitStart: () => void
  /** Called once the exit animation has fully finished. */
  onComplete: () => void
}

/**
 * Full-screen intro: a counter runs 0 → 100 while the name stamps in
 * letter-by-letter, then the whole curtain lifts to reveal the page.
 * Reduced-motion users skip straight to the content.
 */
export function Preloader({ onExitStart, onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0)
  const [exiting, setExiting] = useState(false)
  const exitStartedRef = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onExitStart()
      onComplete()
      return
    }

    // Lock scrolling while the curtain is up.
    document.body.style.overflow = 'hidden'

    const beginExit = () => {
      if (exitStartedRef.current) return
      exitStartedRef.current = true
      setCount(100)
      setExiting(true)
      onExitStart()
    }

    const controls = animate(0, 100, {
      duration: 1.7,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: beginExit,
    })

    // Fail-safe: rAF-driven animations are suspended in hidden/background
    // tabs — never leave a visitor stuck behind the curtain.
    const failSafe = setTimeout(beginExit, 4000)

    return () => {
      controls.stop()
      clearTimeout(failSafe)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      initial={false}
      animate={exiting ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      onAnimationComplete={() => {
        if (exiting) {
          document.body.style.overflow = ''
          onComplete()
        }
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#141618]"
      aria-hidden="true"
    >
      {/* Name stamps in letter-by-letter while the counter runs */}
      <div className="flex overflow-hidden text-[clamp(40px,9vw,110px)] font-bold tracking-[-0.03em] text-white">
        {[...site.name].map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 + site.name.length * 0.07 + 0.1 }}
          className="text-gradient inline-block"
        >
          .
        </motion.span>
      </div>

      {/* Progress line */}
      <div className="mt-8 h-[2px] w-[min(320px,60vw)] overflow-hidden rounded bg-white/10">
        <div
          className="h-full"
          style={{ width: `${count}%`, background: 'var(--accent-gradient)' }}
        />
      </div>

      {/* Counter, pinned bottom-right like a plate number */}
      <span className="absolute bottom-8 right-8 text-6xl font-bold tabular-nums text-white/20 sm:text-8xl">
        {count}
      </span>
    </motion.div>
  )
}
