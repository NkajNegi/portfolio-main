import { Container } from '@/components/layout/Container'
import { SectionNumeral } from '@/components/layout/SectionNumeral'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { site } from '@/content/site'

export function ProjectsSection() {
  // Show every project — no filter tab hiding half the work behind a click.
  // Each card carries its own category badge so the mix stays legible.
  const projects = site.projects

  return (
    <section id="projects" className="section-py relative z-10 scroll-mt-24" aria-label="Projects">
      <Container>
        <div className="relative mb-8">
          <SectionNumeral n="03" />
          <span className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.4em] text-[color:var(--brand-2)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent-gradient)' }}
            />
            Portfolio
          </span>
          <h2 className="m-0 text-h1 font-bold tracking-tight text-[color:var(--text)]">
            <MaskReveal>
              Selected <span className="text-gradient">Works.</span>
            </MaskReveal>
          </h2>
        </div>

        <p className="mb-12 max-w-3xl text-[17px] font-medium leading-relaxed text-[color:var(--text-muted)] sm:mb-16 sm:text-[20px]">
          Showcasing my lifecycle approach to building scalable systems, from feature definition to
          reliable deployment.
        </p>

        <div className="flex w-full flex-col gap-8 sm:gap-12">
          {projects.length > 0 ? (
            projects.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))
          ) : (
            <div className="flex h-64 items-center justify-center rounded-hero border-2 border-dashed border-[color:var(--surface-border)]">
              <p className="text-xl font-medium text-[color:var(--text-muted)]">
                More projects coming soon.
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
