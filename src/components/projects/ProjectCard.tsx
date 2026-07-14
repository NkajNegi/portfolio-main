import { motion } from 'framer-motion'

import type { Project } from '@/content/site'

import { ProjectImageGallery } from './ProjectImageGallery'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="surface group relative flex flex-col gap-8 rounded-hero p-5 lg:flex-row lg:p-8"
    >
      {/* Background to separate from page background animations. Rounded itself
          (instead of overflow-hidden on the card) so the image column can be
          position:sticky — overflow-hidden on an ancestor disables sticky. */}
      <div className="absolute inset-0 -z-10 rounded-hero bg-[color:var(--bg)] opacity-90 backdrop-blur-3xl" />

      <div className="flex w-full flex-col min-w-0 lg:w-1/2">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-[color:var(--brand-2)] shrink-0">
              Project {String(index + 1).padStart(2, '0')}
            </span>
            {/* Category badge — every card is labelled, so all work is visible
                at once without a filter tab hiding half of it. */}
            <span className="shrink-0 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
              {project.category}
            </span>
            <div className="h-[1px] min-w-0 flex-1 bg-gradient-to-r from-[color:var(--brand-2)]/30 to-transparent" />
          </div>
          <h3 className="m-0 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[color:var(--text)] leading-tight break-words">
            {project.title}
          </h3>
        </div>

        <div className="mb-6 text-base sm:text-[17px] font-medium leading-relaxed text-[color:var(--text-muted)] break-words">
          {project.description}
        </div>

        {/* Case-study story: problem → approach → outcome. Falls back to just the
            impact highlight for projects without the extra depth. */}
        {project.problem && (
          <div className="mb-5">
            <h4 className="m-0 mb-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
              The Problem
            </h4>
            <p className="m-0 text-[15px] leading-relaxed text-[color:var(--text-muted)]">
              {project.problem}
            </p>
          </div>
        )}

        {project.approach && project.approach.length > 0 && (
          <div className="mb-5">
            <h4 className="m-0 mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
              Approach
            </h4>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {project.approach.map((step) => (
                <li
                  key={step}
                  className="relative pl-5 text-[15px] leading-relaxed text-[color:var(--text-muted)] before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[color:var(--brand-2)]"
                >
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Outcome / impact highlight */}
        {project.impact && (
          <div className="mb-8 mt-1 rounded-control border border-[color:var(--brand-2)]/20 bg-[color:var(--brand-2)]/10 px-5 py-4">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--brand-2)]">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Outcome
            </div>
            <p className="m-0 text-[15px] font-bold text-[color:var(--text)]">{project.impact}</p>
          </div>
        )}

        <div className="mb-10 flex flex-wrap gap-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="surface rounded-full border-none bg-white/[0.03] px-4 py-2 text-xs sm:text-[13px] font-bold tracking-wide text-[color:var(--text-muted)] break-words"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-6 lg:gap-10">
          {project.caseStudyHref && (
            <a
              href={project.caseStudyHref}
              target="_blank"
              rel="noreferrer"
              className="group/link relative flex items-center gap-2 text-sm sm:text-[17px] font-bold text-[color:var(--brand-2)] shrink-0"
            >
              <span>Case Study</span>
              <svg className="h-5 w-5 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group/live relative flex items-center gap-2 text-sm sm:text-[17px] font-bold text-[color:var(--text)] transition-colors hover:text-[color:var(--brand-2)] shrink-0"
            >
              <span>Live</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {project.repoHref && (
            <a
              href={project.repoHref}
              target="_blank"
              rel="noreferrer"
              className="group/repo flex items-center gap-3 text-sm sm:text-[17px] font-bold text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)] shrink-0"
            >
              <svg className="h-6 w-6 opacity-60 transition-opacity group-hover/repo:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>
      {/* Image column: fixed 16:10 frame (matches the 1440×900 screenshots, so no
          crop-zoom), top-aligned and sticky so it follows as you read the
          case-study text instead of stretching to the column's full height. */}
      <div className="w-full min-w-0 self-start p-2 lg:sticky lg:top-24 lg:w-1/2 lg:p-0">
        <ProjectImageGallery images={project.images} title={project.title} url={project.href} />
      </div>
    </motion.article>
  )
}
