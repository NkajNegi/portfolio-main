import { useEffect, useState } from 'react'

import { BlogCard } from '@/components/blog/BlogCard'
import { Container } from '@/components/layout/Container'
import { SectionNumeral } from '@/components/layout/SectionNumeral'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { site } from '@/content/site'
import { fetchHashnodePosts } from '@/lib/hashnode'

// Smooth left/right edge fade via a mask (theme-proof: reveals the page
// background instead of overlaying a colour, so no grey band in light mode).
const EDGE_FADE = 'linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)'
const edgeFadeStyle = { WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE } as const

export function AnimatedHeroSection() {
  const [blogs, setBlogs] = useState([...site.blog])

  useEffect(() => {
    async function getPosts() {
      if (site.hashnodeUsername) {
        const posts = await fetchHashnodePosts(site.hashnodeUsername)
        if (posts.length > 0) setBlogs(posts)
      }
    }
    getPosts()
  }, [])

  // Mobile shows a short, static list instead of the marquee.
  const latest = blogs.slice(0, 4)

  return (
    <section
      id="writing"
      className="section-py relative z-10 flex flex-col justify-center overflow-hidden scroll-mt-24 lg:min-h-screen"
      aria-label="Writing"
    >
      <Container>
        <div className="relative mb-10 flex flex-col gap-4 sm:mb-16 sm:text-center">
          <SectionNumeral n="05" />
          <span className="inline-flex items-center gap-2 self-start text-sm font-bold uppercase tracking-[0.3em] text-[color:var(--brand-2)] sm:self-center">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent-gradient)' }}
            />
            Writing
          </span>
          <h2 className="m-0 text-h2 font-bold tracking-tight text-[color:var(--text)]">
            <MaskReveal>
              Latest Articles &amp;{' '}
              <span className="text-gradient">
                Deep Dives.
              </span>
            </MaskReveal>
          </h2>
          <p className="max-w-2xl text-[clamp(16px,2vw,20px)] font-medium leading-relaxed text-[color:var(--text-muted)] sm:mx-auto">
            Notes on frontend engineering, backend systems, and building for the web.
          </p>
        </div>
      </Container>

      {/* ── Mobile: clean stacked list ─────────────────────────────────────── */}
      <Container className="sm:hidden">
        <ul className="flex flex-col gap-4">
          {/* Key by title, not href — placeholder posts can share the same URL. */}
          {latest.map((post) => (
            <li key={post.title}>
              <a
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="surface flex flex-col gap-2 rounded-card p-5"
              >
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-[color:var(--brand-2)]">{post.tags[0]}</span>
                  <span className="font-medium text-[color:var(--text-muted)]">{post.readTime}</span>
                </div>
                <h3 className="m-0 text-base font-bold leading-snug text-[color:var(--text)]">
                  {post.title}
                </h3>
                <p className="m-0 line-clamp-2 text-sm text-[color:var(--text-muted)]">
                  {post.summary}
                </p>
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`https://hashnode.com/@${site.hashnodeUsername}`}
          target="_blank"
          rel="noreferrer"
          className="glass-button mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-base font-bold text-[color:var(--text)]"
        >
          View full archive →
        </a>
      </Container>

      {/* ── Desktop: single animated marquee (pauses on hover) ─────────────── */}
      <div className="hidden sm:block">
        <div className="relative overflow-hidden py-4" style={edgeFadeStyle}>
          {/* The list is rendered twice for a seamless loop. Only the first copy
              is exposed to assistive tech; the visual duplicate is inert + hidden
              so screen readers and keyboard users encounter each post once. */}
          <div className="hover-pause flex w-max gap-6 animate-scroll-left">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="m-0 flex shrink-0 list-none gap-6 p-0"
                aria-hidden={copy === 1 || undefined}
                inert={copy === 1 || undefined}
              >
                {blogs.map((post, idx) => (
                  <li key={idx}>
                    <BlogCard
                      post={post}
                      brandColorClass="text-[color:var(--brand-2)]"
                      hoverBorderClass="hover:border-[color:var(--brand-2)]"
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
