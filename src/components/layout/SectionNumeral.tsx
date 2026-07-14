/**
 * Huge, faint outlined numeral rendered behind a section header — an editorial
 * "chapter number" that gives the long single page visual rhythm. Purely
 * decorative: aria-hidden, non-interactive, sits behind the header text.
 * The parent must be `relative`.
 */
export function SectionNumeral({ n, className }: { n: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute right-0 top-0 -z-10 select-none font-display text-[clamp(5rem,12vw,9rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--surface-border-hover)] ${className ?? ''}`}
    >
      {n}
    </span>
  )
}
