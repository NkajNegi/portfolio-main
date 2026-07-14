import { motion } from 'framer-motion'
import { Cloud, Cpu, Globe, Layout } from 'lucide-react'

import { Container } from '@/components/layout/Container'
import { SectionNumeral } from '@/components/layout/SectionNumeral'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { Reveal } from '@/components/motion/Reveal'
import { DURATION, EASE } from '@/lib/motion'

const skillGroups = [
  {
    title: 'Full Stack Development',
    description:
      'Building modern web applications with a strong emphasis on scalable frontend state management and maintainable backend structure.',
    icon: Globe,
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
    className: 'lg:col-span-8',
    accent: 'text-[color:var(--brand-2)]',
  },
  {
    title: 'DevOps & Infrastructure',
    description:
      'Designing resilient cloud architectures and orchestrating automated deployment pipelines.',
    icon: Cloud,
    skills: ['AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    className: 'lg:col-span-4',
    accent: 'text-[color:var(--brand)]',
  },
  {
    title: 'Modern UI/UX',
    description:
      'Creating polished, accessible interfaces with fluid interactive motion and responsive design systems.',
    icon: Layout,
    skills: ['Tailwind CSS', 'Framer Motion', 'Accessibility', 'CSS Modules'],
    className: 'lg:col-span-5',
    accent: 'text-[color:var(--brand-2)]',
  },
  {
    title: 'Databases & API Design',
    description:
      'Architecting high-performance data models and strongly-typed API layers for maximum throughput.',
    icon: Cpu,
    skills: ['Go', 'PostgreSQL', 'Redis', 'GraphQL'],
    className: 'lg:col-span-7',
    accent: 'text-[color:var(--brand)]',
  },
]

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="section-py section-band relative z-10 scroll-mt-24 pb-28 lg:pb-40"
      aria-label="Skills & Expertise"
    >
      <Container className="relative z-10">
        <div className="relative mb-16 flex flex-col items-start gap-4">
          <SectionNumeral n="04" />
          <Reveal
            direction="left"
            distance={20}
            className="flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-5 py-2 text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--brand-2)]"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: 'var(--accent-gradient)' }}
            />
            Capabilities
          </Reveal>
          <h2 className="m-0 text-h2 font-bold tracking-tight text-[color:var(--text)]">
            <MaskReveal>
              {/* The page's single outline-type flourish. */}
              Technical <span className="text-outline">Expertise</span>
            </MaskReveal>
          </h2>
        </div>

        {/* Bento grid only from lg up — at md the 4-col cards were too narrow
            for their headings ("Infrastructure" clipped at the card edge). */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: DURATION.base, ease: EASE }}
              whileHover={{ y: -6 }}
              className={['surface group relative overflow-hidden rounded-card sm:rounded-hero p-6 sm:p-10', group.className].join(
                ' ',
              )}
            >
              {/* Static brand glow, brightening slightly on hover. */}
              <div
                className={[
                  'absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] opacity-20 transition-opacity duration-700 group-hover:opacity-40 -z-10',
                  group.accent.replace('text', 'bg'),
                ].join(' ')}
              />

              {/* Oversized watermark of the card's icon — depth without new assets. */}
              <group.icon
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-8 -right-8 h-44 w-44 -rotate-12 text-[color:var(--text)] opacity-[0.05]"
              />

              <div className="relative z-10 flex h-full flex-col justify-between gap-8 sm:gap-12">
                <div>
                  <div
                    className={[
                      'mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-control sm:rounded-card border border-[color:var(--surface-border)] bg-[color:var(--surface)] transition-transform duration-500 group-hover:scale-110',
                      group.accent,
                    ].join(' ')}
                  >
                    <group.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="mb-3 sm:mb-4 text-2xl lg:text-3xl font-bold tracking-tight break-words text-[color:var(--text)]">
                    {group.title}
                  </h3>
                  <p className="max-w-[380px] text-base sm:text-[18px] font-medium text-[color:var(--text-muted)] leading-relaxed">
                    {group.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-4 py-1.5 sm:px-5 sm:py-2 text-[13px] sm:text-[14px] font-bold text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--text)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href="#projects"
            className="glass-button group flex items-center justify-center gap-3 rounded-full px-6 py-4 text-base sm:px-10 sm:py-5 sm:text-xl font-bold text-[color:var(--text)] text-center"
          >
            View how I apply these skills in my projects
            <svg
              className="h-6 w-6 text-[color:var(--brand-2)] transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </Container>
    </section>
  )
}
