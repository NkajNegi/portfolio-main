import { lazy, Suspense } from 'react'

import { AmbientBackground } from '@/components/effects/AmbientBackground'
import { BridgeModel } from '@/components/effects/BridgeModel'
import { GradualBlur } from '@/components/effects/GradualBlur'
import { SplashCursor } from '@/components/effects/SplashCursor'
import { ScrollProgress } from '@/components/feedback/ScrollProgress'
import { SkipLink } from '@/components/layout/SkipLink'
import { EdgeNav } from '@/components/nav/EdgeNav'
import { WelcomeSection } from '@/components/sections/WelcomeSection'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

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
    <div id="top" className="relative transition-colors duration-500">
      <BridgeModel />
      <SkipLink targetId="main" />
      <ScrollProgress />
      {/* Frosted-glass scrims framing the fold; content scrolls under them. */}
      <GradualBlur edge="top" />
      <GradualBlur edge="bottom" heightClass="h-20" maxBlur={10} />
      <EdgeNav />
      {/* Persistent theme toggle, mirroring the nav corner. Sits above the blur
          (z-60) so the control stays crisp, and no longer scrolls away with the
          hero. */}
      <ThemeToggle className="fixed left-5 top-5 z-[60] md:left-8 md:top-8" />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>

      {/* The main wrapper is now transparent, allowing the 3D model to show through */}
      <div className="relative z-10 transition-colors duration-500">
        {/* Ambient layers behind content: static grain/wash + brand-tinted fluid
            splash cursor. Both sit above the page bg, below all content. */}
        <AmbientBackground />
        <SplashCursor />

        <main id="main">
          {/* Spacer so the 3D model is fully visible before scrolling. 
              Increased to 1500svh to ensure it takes a very long scroll to reach the Welcome Section */}
          <div className="h-[1200svh] w-full pointer-events-none" />
          
          <WelcomeSection />
          
          {/* Below-the-fold sections and Footer are grouped so the sticky footer never overlaps the transparent top sections */}
          <div className="relative z-20">
            {/* The solid content that covers the footer */}
            <div className="relative z-10 bg-[color:var(--bg)] lg:rounded-b-hero lg:pb-10 lg:shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
              <Suspense fallback={null}>
                <AboutSection />
                <ExperienceSection />
                <ProjectsSection />
                <SkillsSection />
                <AnimatedHeroSection />
                <ContactSection />
              </Suspense>
            </div>

            {/* Footer is revealed by the content sliding up on desktop; normal flow on
                mobile. The sticky reveal only ever shows the bottom 100vh of the
                footer, so it's gated to viewports tall enough to fit the whole thing. */}
            <div className="w-full lg:z-0 [@media(min-height:800px)]:lg:sticky [@media(min-height:800px)]:lg:bottom-0">
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
