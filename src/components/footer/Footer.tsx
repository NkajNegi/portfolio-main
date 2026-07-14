import { motion } from 'framer-motion'
import { ArrowUp, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Container } from '@/components/layout/Container'
import { site } from '@/content/site'

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Writing', href: '#writing' },
  { label: 'Contact', href: '#contact' },
]

export function Footer() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata', // TODO: set your timezone
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
      setTime(formatter.format(new Date()))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentYear = new Date().getFullYear()

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      className="relative z-0 overflow-hidden bg-[color:var(--bg)] pt-14 pb-8 transition-colors duration-500 sm:pt-16"
      aria-label="Footer"
    >
      {/* Background glow + grid */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <div className="absolute -left-[20%] top-0 hidden h-[70%] w-[50%] rounded-full bg-[color:var(--brand)]/20 blur-[150px] md:block" />
        <div className="absolute -right-[20%] bottom-0 hidden h-[70%] w-[50%] rounded-full bg-[color:var(--brand-2)]/20 blur-[150px] md:block" />
        <div className="absolute inset-0 bg-[linear-gradient(var(--text-muted)_1px,transparent_1px),linear-gradient(90deg,var(--text-muted)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <Container className="relative z-10">
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col items-center text-center sm:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-5 py-2.5 text-xs font-bold text-[color:var(--text)] shadow-xl backdrop-blur-md sm:text-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            Available for new opportunities
          </div>

          {/* text-h2 (not h1): the footer must fit inside one viewport for the
              sticky-reveal to show it fully — see the wrapper in HomePage. */}
          <h2 className="mb-6 text-h2 font-black tracking-tighter text-[color:var(--text)]">
            Let&apos;s build <br />
            <span className="text-gradient">
              something great.
            </span>
          </h2>

          <a
            href={`mailto:${site.email}`}
            className="btn-accent group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-base font-bold sm:px-10 sm:py-4 sm:text-lg"
          >
            <span className="relative z-10 flex items-center gap-3">
              Say Hello
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </a>
        </motion.div>

        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--surface-border)] to-transparent sm:mb-10" />

        {/* Links & info */}
        <div className="mb-10 grid grid-cols-2 gap-8 text-[color:var(--text-muted)] sm:gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
            <a href="#top" onClick={scrollToTop} className="text-3xl font-black tracking-tight text-[color:var(--text)] transition-colors hover:text-[color:var(--brand-2)]">
              {site.name}
              <span className="text-[color:var(--brand-2)]">.</span>
            </a>
            <p className="max-w-[260px] text-[15px] font-medium leading-relaxed">
              {site.headline} crafting high-performance, accessible web experiences.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">Navigation</h4>
            <nav className="flex flex-col gap-3 font-medium">
              {navLinks.map((item) => (
                <a key={item.href} href={item.href} className="link-underline w-fit transition-all hover:text-[color:var(--text)]">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">Socials</h4>
            <nav className="flex flex-col gap-3 font-medium">
              {site.socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="link-underline flex w-fit items-center gap-2 transition-all hover:text-[color:var(--brand-2)]">
                  {s.label}
                  <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                </a>
              ))}
            </nav>
          </div>

          {/* Location (Spotify mock dropped) */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">Location</h4>
            <div className="flex flex-col gap-1 font-medium">
              <span className="text-[color:var(--text)]">{site.location}</span>
              <span className="font-mono text-[color:var(--brand-2)]">{time}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-5 rounded-card border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-5 py-5 backdrop-blur-md sm:px-8 md:flex-row">
          <span className="text-center text-sm font-bold text-[color:var(--text-muted)]">
            © {currentYear} {site.name}. All rights reserved.
          </span>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm font-bold text-[color:var(--text-muted)]">
              Built with <span className="text-[color:var(--text)]">React</span> &amp;{' '}
              <span className="text-[color:var(--text)]">Tailwind</span>
            </span>

            <a
              href="#top"
              onClick={scrollToTop}
              className="surface group flex h-10 w-10 items-center justify-center rounded-full border-none text-[color:var(--text)] transition-all hover:scale-110 hover:text-[color:var(--brand-2)] active:scale-95"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
