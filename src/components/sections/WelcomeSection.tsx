import { motion } from 'framer-motion'

import { HeroTerminal } from '@/components/hero/HeroTerminal'
import { Container } from '@/components/layout/Container'
import { Magnetic } from '@/components/motion/Magnetic'
import { ScrambleText } from '@/components/motion/ScrambleText'
import { site } from '@/content/site'

export function WelcomeSection() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-transparent" aria-label="Welcome">
      {/* The HeroGradient is removed/hidden to allow the 3D BridgeModel to act as the background */}

      {/*
        This wrapper ensures all absolute elements (Decorative tags, ThemeToggle, Scroll indicator)
        respect the website's width by using the Container component.
      */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Container className="relative h-full">
          {/* Scroll affordance: a soft-bouncing down-chevron over a fading line.
              The arrow carries the "keep scrolling" meaning on its own — no label. */}
          <motion.a
            href="#about"
            aria-label="Scroll to content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{
              opacity: { delay: 1.2, duration: 0.6 },
              y: { delay: 1.2, duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="pointer-events-auto absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--brand-2)] sm:flex"
          >
            <div className="h-10 w-[2px] bg-gradient-to-b from-[color:var(--brand-2)] to-transparent" />
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.a>
        </Container>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full w-full items-center py-24">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            <div className="relative z-10 max-w-[900px] lg:max-w-[700px] flex-1">
              {/* Static spotlight behind the name: gives the eye a focal point
                  so the hierarchy isn't carried by font size alone. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-32 -top-24 -z-10 h-[480px] w-[640px] rounded-full opacity-80 blur-3xl [.light_&]:opacity-50"
                style={{
                  background:
                    'radial-gradient(closest-side, color-mix(in srgb, var(--brand) 18%, transparent), transparent)',
                }}
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="m-0 mb-4 text-sm font-bold uppercase tracking-[0.4em] text-[color:var(--brand-2)] lg:text-base drop-shadow-lg"
              >
                <ScrambleText text={`${site.location} • AVAILABLE FOR ROLES`} duration={1.4} />
              </motion.p>
              
              {/* Cap ~132px: at Clash Display's width "Ashish." fills the 700px column
                  at ~138px, so a higher cap would wrap the name onto two lines. */}
              {/* Real, immediately-painted text (best LCP) — the dramatic
                  letter-by-letter reveal already plays in the preloader, so the
                  name simply lands here as the curtain lifts. The "." pops in
                  with a drifting gradient as a small enhancement. */}
              <h1 className="m-0 mb-6 text-display tracking-[-0.05em] font-bold text-[color:var(--text)]">
                {site.name}
                <motion.span
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.45, type: 'spring', bounce: 0.5 }}
                  className="animate-gradient-text text-gradient inline-block"
                >
                  .
                </motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="m-0 mb-12 max-w-[700px] text-lead font-medium text-[color:var(--text)]/90"
              >
                I&apos;m a{' '}
                <strong className="font-bold text-[color:var(--text)]">{site.headline}</strong> who
                engineers scalable backend systems and responsive modern web applications.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-6"
              >
                {/* Primary: solid accent. Secondary: ghost. Both magnetic on hover. */}
                <Magnetic>
                  {/* No surface here: its background overrides the solid accent fill.
                      Brand-tinted glow (not a generic black shadow) marks this as the
                      primary action; the arrow slide matches the rest of the site. */}
                  <a
                    className="group pointer-events-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[color:var(--brand-2)] px-10 py-5 text-lg font-bold text-white shadow-[0_10px_40px_-10px_var(--brand-2)] transition-all hover:bg-cyan-400 hover:shadow-[0_14px_50px_-8px_var(--brand-2)] active:scale-95"
                    href="#projects"
                  >
                    View Projects
                    <svg
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    className="group pointer-events-auto inline-flex items-center justify-center gap-2.5 rounded-full border border-[color:var(--surface-border)] bg-transparent px-10 py-5 text-lg font-bold text-[color:var(--text)] transition-colors hover:border-[color:var(--brand-2)]/40 hover:bg-white/10"
                    href={site.resumeHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download CV
                    <svg
                      className="h-5 w-5 opacity-70 transition-transform group-hover:translate-y-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" />
                    </svg>
                  </a>
                </Magnetic>
              </motion.div>
            </div>

            {/* Right Hemisphere: Interactive Terminal (desktop only) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pointer-events-auto relative z-10 hidden max-w-[500px] flex-1 justify-end lg:flex"
            >
              <HeroTerminal />
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  )
}
