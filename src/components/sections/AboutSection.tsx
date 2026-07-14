import { Check } from 'lucide-react'

import { GitHubStats } from '@/components/github/GitHubStats'
import { Container } from '@/components/layout/Container'
import { SectionNumeral } from '@/components/layout/SectionNumeral'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { site } from '@/content/site'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'A'
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="section-py relative z-10 scroll-mt-24"
      aria-label="About"
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          {/* Left: bio */}
          <Reveal amount={0.3}>
            <div className="relative mb-6 flex items-center gap-4">
              <SectionNumeral n="01" />
              {/* Avatar: photo if provided, otherwise a gradient monogram */}
              {site.about.photo ? (
                <img
                  src={site.about.photo}
                  alt={site.name}
                  className="h-16 w-16 rounded-control object-cover sm:h-20 sm:w-20"
                />
              ) : (
                <div className="surface flex h-16 w-16 shrink-0 items-center justify-center rounded-control text-2xl font-black text-[color:var(--text)] sm:h-20 sm:w-20 sm:text-3xl">
                  <span className="text-gradient">
                    {initials(site.name)}
                  </span>
                </div>
              )}
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.4em] text-[color:var(--brand-2)]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--accent-gradient)' }}
                  />
                  About
                </span>
                <h2 className="m-0 text-h3 font-bold tracking-tight text-[color:var(--text)]">
                  <MaskReveal>Who I am</MaskReveal>
                </h2>
              </div>
            </div>

            <p className="mb-8 max-w-2xl text-[clamp(17px,2vw,20px)] font-medium leading-relaxed text-[color:var(--text-muted)]">
              {site.about.summary}
            </p>

            <Stagger role="list" className="flex flex-col gap-3">
              {site.about.facts.map((fact) => (
                <StaggerItem key={fact} role="listitem" className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-2)]/15 text-[color:var(--brand-2)]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-base font-medium text-[color:var(--text)] sm:text-[17px]">
                    {fact}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>

          {/* Right: live GitHub stats */}
          <Reveal delay={0.1} amount={0.3}>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                Live from GitHub
              </span>
            </div>
            <GitHubStats />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
