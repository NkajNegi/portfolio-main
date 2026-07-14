import { motion, useScroll, useSpring } from 'framer-motion'
import { Briefcase } from 'lucide-react'
import { useRef } from 'react'

import { Container } from '@/components/layout/Container'
import { SectionNumeral } from '@/components/layout/SectionNumeral'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { site } from '@/content/site'
import { DURATION, EASE } from '@/lib/motion'

export function ExperienceSection() {
  // The timeline line "draws" itself (scaleY 0 → 1) as the list scrolls by.
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 80%', 'end 55%'],
  })
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <section
      id="experience"
      className="section-py relative z-10 scroll-mt-24"
      aria-label="Experience"
    >
      <Container>
        <div className="relative mb-12 sm:mb-16">
          <SectionNumeral n="02" />
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.4em] text-[color:var(--brand-2)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent-gradient)' }}
            />
            Career
          </span>
          <h2 className="m-0 mt-3 text-h2 font-bold tracking-tight text-[color:var(--text)]">
            <MaskReveal>Experience</MaskReveal>
          </h2>
        </div>

        {/* Vertical timeline (single column, mobile-friendly). A faint track sits
            behind a gradient line that draws in as you scroll. */}
        <ol ref={listRef} className="relative ml-3 flex flex-col gap-10 pl-8 sm:ml-4 sm:pl-10">
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-[2px] bg-[color:var(--surface-border)]"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: lineScale }}
            className="absolute left-0 top-0 h-full w-[2px] origin-top bg-gradient-to-b from-[color:var(--brand)] via-[color:var(--brand-2)] to-[color:var(--brand-2)]"
          />
          {site.experience.map((job, i) => (
            <motion.li
              key={`${job.company}-${job.start}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: DURATION.fast, ease: EASE, delay: i * 0.05 }}
              className="relative"
            >
              {/* Node */}
              <span className="surface absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--brand-2)] sm:-left-[52px] sm:h-9 sm:w-9">
                <Briefcase className="h-4 w-4" />
              </span>

              <div className="surface rounded-card p-5 sm:p-7">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <h3 className="m-0 text-xl font-bold tracking-tight text-[color:var(--text)] sm:text-2xl">
                    {job.role}
                  </h3>
                  <span className="shrink-0 text-sm font-bold text-[color:var(--brand-2)]">
                    {job.start} — {job.end}
                  </span>
                </div>
                <p className="m-0 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[color:var(--text-muted)]">
                  <span className="font-bold text-[color:var(--text)]">{job.company}</span>
                  <span className="rounded-full bg-[color:var(--surface)] px-3 py-0.5 text-xs font-bold uppercase tracking-wide">
                    {job.kind}
                  </span>
                  {job.location && <span>{job.location}</span>}
                </p>
                <ul className="flex flex-col gap-2">
                  {job.highlights.map((h) => (
                    <li
                      key={h}
                      className="relative pl-5 text-[15px] font-medium leading-relaxed text-[color:var(--text-muted)] before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[color:var(--brand-2)]"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
