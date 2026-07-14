import { ContactForm } from '@/components/contact/ContactForm'
import { Container } from '@/components/layout/Container'
import { SectionNumeral } from '@/components/layout/SectionNumeral'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { Reveal } from '@/components/motion/Reveal'
import { site } from '@/content/site'

export function ContactSection() {
  return (
    <section
      id="contact"
      className="section-py relative z-10 scroll-mt-24 bg-transparent pb-28 lg:pb-40"
      aria-label="Contact"
    >
      <Container>
        <div className="surface group relative overflow-hidden rounded-card px-6 py-12 sm:rounded-hero sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          {/* Background to separate from page background animations */}
          <div className="absolute inset-0 -z-10 bg-[color:var(--bg)] opacity-90 backdrop-blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionNumeral n="06" />
            {/* Left: pitch */}
            <Reveal distance={20} className="flex flex-col gap-6">
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.4em] text-[color:var(--brand-2)]">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent-gradient)' }}
                />
                Let&apos;s Connect
              </span>
              <h2 className="m-0 text-h2 font-bold tracking-tight text-[color:var(--text)]">
                <MaskReveal>
                  Have a project <span className="text-[color:var(--text-muted)]">in mind?</span>
                </MaskReveal>
              </h2>
              <p className="m-0 max-w-[440px] text-[clamp(16px,2vw,20px)] font-medium leading-relaxed text-[color:var(--text-muted)]">
                I&apos;m open to new opportunities, collaborations, and interesting problems.
                Drop a message and I&apos;ll reply soon.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="link-underline w-fit text-base font-bold text-[color:var(--brand-2)]"
              >
                or email me directly →
              </a>
            </Reveal>

            {/* Right: form */}
            <Reveal distance={20} delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>

          {/* Static brand glows (desktop only - trimmed on mobile for performance).
              No longer animated: ambient motion is budgeted to the hero + timeline. */}
          <div className="absolute -right-20 -top-20 hidden h-80 w-80 rounded-full bg-[color:var(--brand-2)]/10 blur-[100px] md:block" />
          <div className="absolute -bottom-20 -left-20 hidden h-80 w-80 rounded-full bg-[color:var(--brand)]/10 blur-[100px] md:block" />
        </div>
      </Container>
    </section>
  )
}
