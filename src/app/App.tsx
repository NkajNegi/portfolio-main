import { MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import { Preloader } from '@/components/effects/Preloader'
import { HomePage } from '@/pages/HomePage'

type Phase = 'loading' | 'revealing' | 'done'

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading')

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1, // Adjust smoothness (lower = smoother/slower)
      wheelMultiplier: 0.8 // Slightly dampen fast mouse wheels
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // reducedMotion="user" makes all framer-motion animations respect the
  // visitor's "prefers reduced motion" OS setting.
  return (
    <MotionConfig reducedMotion="user">
      {phase !== 'done' && (
        <Preloader
          onExitStart={() => setPhase('revealing')}
          onComplete={() => setPhase('done')}
        />
      )}
      {/* The page mounts as the curtain starts lifting, so the hero's entrance
          animations play in view instead of finishing behind the preloader. */}
      {phase !== 'loading' && <HomePage />}
    </MotionConfig>
  )
}
