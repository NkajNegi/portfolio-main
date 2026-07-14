import { lazy, Suspense } from 'react'

import { AmbientBackground } from '@/components/effects/AmbientBackground'
import { ScrollProgress } from '@/components/feedback/ScrollProgress'
import { SkipLink } from '@/components/layout/SkipLink'
import { EdgeNav } from '@/components/nav/EdgeNav'
import { WelcomeSection } from '@/components/sections/WelcomeSection'

// Everything below the hero is code-split so the initial bundle carries only
// the above-the-fold hero + page chrome; the rest streams in as separate chunks
// after first paint. (Named exports → adapt to the default export React.lazy expects.)
const AboutSection = lazy(() =>
  import('@/components/sections/AboutSection').then((m) => ({ default: m.AboutSection })),
)
const ExperienceSection = lazy(() =>
  import('@/components/sections/ExperienceSection').then((m) => ({ default: m.ExperienceSection })),
)
const ProjectsSection = lazy(() =>
  import('@/components/sections/ProjectsSection').then((m) => ({ default: m.ProjectsSection })),
)
const SkillsSection = lazy(() =>
  import('@/components/sections/SkillsSection').then((m) => ({ default: m.SkillsSection })),
)
const AnimatedHeroSection = lazy(() =>
  import('@/components/sections/AnimatedHeroSection').then((m) => ({
    default: m.AnimatedHeroSection,
  })),
)
const ContactSection = lazy(() =>
  import('@/components/sections/ContactSection').then((m) => ({ default: m.ContactSection })),
)
const Footer = lazy(() => import('@/components/footer/Footer').then((m) => ({ default: m.Footer })))
const CommandPalette = lazy(() =>
  import('@/components/nav/CommandPalette').then((m) => ({ default: m.CommandPalette })),
)

export function HomePage() {
  return (
    <div id="top" className="relative bg-[color:var(--bg)] transition-colors duration-500">
      <SkipLink targetId="main" />
      <ScrollProgress />
      <EdgeNav />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>

      {/*
        The main content wrapper sits above the footer (z-10) and slides up to
        reveal the sticky footer underneath as you reach the end of the scroll.
      */}
      <div className="relative z-10 bg-[color:var(--bg)] transition-colors duration-500 lg:rounded-b-hero lg:pb-10 lg:shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        {/* Static film-grain texture sits above the wrapper background but behind content */}
        <AmbientBackground />

        <main id="main">
          <WelcomeSection />
          {/* Below-the-fold sections load as they mount; the fallback is null
              because each has its own scroll-reveal once its chunk arrives. */}
          <Suspense fallback={null}>
            <AboutSection />
            <ExperienceSection />
            <ProjectsSection />
            <SkillsSection />
            <AnimatedHeroSection />
            <ContactSection />
          </Suspense>
        </main>
      </div>

      {/* Footer is revealed by the content sliding up on desktop; normal flow on
          mobile. The sticky reveal only ever shows the bottom 100vh of the
          footer, so it's gated to viewports tall enough to fit the whole thing —
          shorter screens get normal flow (scrollable, never clipped). */}
      <div className="w-full lg:z-0 [@media(min-height:800px)]:lg:sticky [@media(min-height:800px)]:lg:bottom-0">
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </div>
  )
}
