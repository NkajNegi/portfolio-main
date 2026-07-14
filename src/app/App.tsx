import { MotionConfig } from 'framer-motion'
import { useState } from 'react'

import { Preloader } from '@/components/effects/Preloader'
import { HomePage } from '@/pages/HomePage'

type Phase = 'loading' | 'revealing' | 'done'

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading')

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
