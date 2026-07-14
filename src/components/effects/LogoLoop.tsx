import { useEffect, useMemo, useRef, useState } from 'react'

import { techLogos } from '@/lib/techLogos'

/**
 * Decorative marquee of monochrome tech logos that sits BEHIND the Skills bento.
 *
 * Guardrails (this is background decoration, not content):
 *  - aria-hidden + inert: assistive tech and keyboard focus never enter it.
 *  - Each row is rendered twice (a set + a duplicate) for a seamless -50% loop.
 *  - Rows counter-scroll (alternating left/right); 2 rows on mobile, 4 on desktop.
 *  - An IntersectionObserver adds `.marquee-paused` when the section is off-screen
 *    so idle rows burn zero CPU.
 *  - prefers-reduced-motion: the global reduced-motion rule freezes the CSS
 *    animation; we also render fewer rows to keep the static frame calm.
 */

function shuffle<T>(arr: T[], seed: number): T[] {
  // Deterministic per-row shuffle so rows differ but stay stable across renders.
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function LogoRow({ seed, reverse }: { seed: number; reverse: boolean }) {
  const items = useMemo(() => shuffle(techLogos, seed), [seed])
  return (
    <div className="flex w-full py-4 sm:py-6">
      <div
        className={`flex w-max shrink-0 ${
          reverse ? 'animate-scroll-right' : 'animate-scroll-left'
        }`}
      >
        {/* Rendered twice: the -50% translate loops seamlessly. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex w-max shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
            {items.map((logo, i) => (
              <svg
                key={`${copy}-${i}`}
                viewBox="0 0 24 24"
                className="h-8 w-8 shrink-0 fill-[color:var(--text)] sm:h-10 sm:w-10"
              >
                <path d={logo.path} />
              </svg>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function LogoLoop() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Pause every row while the loop is scrolled out of view.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle('marquee-paused', !entry.isIntersecting),
      { rootMargin: '100px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scroll-velocity coupling: the rows drift at their CSS base speed, then
  // briefly speed up with scroll velocity and ease back — a subtle "the page is
  // moving" realism. Done by nudging each CSS animation's playbackRate (keeps
  // the animation GPU-driven; only does work during/after a scroll).
  useEffect(() => {
    const el = rootRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const MAX_BOOST = 4 // playbackRate up to 5×
    const rows = () =>
      [...el.querySelectorAll('.animate-scroll-left, .animate-scroll-right')].flatMap((r) =>
        r.getAnimations(),
      )
    let boost = 0
    let lastY = window.scrollY
    let lastT = performance.now()
    let raf = 0
    let decaying = false

    const apply = () => rows().forEach((a) => (a.playbackRate = 1 + boost))
    const decay = () => {
      boost *= 0.9
      if (boost < 0.02) {
        boost = 0
        apply()
        decaying = false
        return
      }
      apply()
      raf = requestAnimationFrame(decay)
    }
    const onScroll = () => {
      const now = performance.now()
      const v = Math.abs(window.scrollY - lastY) / Math.max(now - lastT, 1) // px/ms
      lastY = window.scrollY
      lastT = now
      boost = Math.min(boost + v * 1.2, MAX_BOOST)
      if (!decaying) {
        decaying = true
        raf = requestAnimationFrame(decay)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
    // rows() re-queries the DOM live, so it picks up row-count changes without
    // needing to re-run this effect.
  }, [])

  const rowCount = isDesktop ? 4 : 2

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      inert
      className="marquee-edge-fade pointer-events-none absolute inset-0 -z-[1] flex select-none flex-col justify-center gap-6 opacity-[0.35] sm:gap-10"
    >
      {Array.from({ length: rowCount }).map((_, i) => (
        <LogoRow key={i} seed={i * 7 + 3} reverse={i % 2 === 1} />
      ))}
    </div>
  )
}
