import { TiltCard } from '@/components/motion/TiltCard'
import type { BlogPost } from '@/content/site'

type BlogCardProps = {
  post: BlogPost
  brandColorClass: string // e.g., 'text-[color:var(--brand-2)]'
  hoverBorderClass: string // e.g., 'hover:border-[color:var(--brand-2)]'
}

export function BlogCard({ post, brandColorClass, hoverBorderClass }: BlogCardProps) {
  return (
    <TiltCard maxTilt={6} className="w-[320px] shrink-0 rounded-card">
      <a
        href={post.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`surface group/card relative flex w-full flex-col gap-4 rounded-card p-8 hover:bg-[color:var(--surface)] ${hoverBorderClass}`}
      >
      {/* Background to separate from page background animations */}
      <div className="absolute inset-0 -z-10 rounded-card bg-[color:var(--bg)] opacity-90 backdrop-blur-3xl" />

      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${brandColorClass}`}>
          {post.tags[0]}
        </span>
        <span className="text-[11px] font-medium text-[color:var(--text-muted)] opacity-60">
          {new Date(post.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
        </span>
      </div>
      <h4 className={`line-clamp-2 text-base font-bold leading-tight group-hover/card:${brandColorClass}`}>
        {post.title}
      </h4>
      <p className="line-clamp-2 text-sm text-[color:var(--text-muted)] leading-relaxed">
        {post.summary}
      </p>
      <div className={`mt-2 flex items-center gap-2 text-xs font-bold ${brandColorClass} opacity-0 transition-opacity duration-300 group-hover/card:opacity-100`}>
        Read Article 
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
      </a>
    </TiltCard>
  )
}
