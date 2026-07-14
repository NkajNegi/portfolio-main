/**
 * Progressive ("gradual") blur scrim pinned to an edge of the viewport, so page
 * content scrolls *under* frosted glass — the nav reads as floating on the top
 * one; the bottom one frames the fold.
 *
 * Technique: several stacked backdrop-filter layers with increasing blur, each
 * masked to a feathered horizontal band via `mask-image`. The bands overlap and
 * the blur ramps up toward the framed edge, which reads as one smooth gradient
 * rather than a hard frosted bar. A faint background tint keeps content legible.
 *
 * Desktop-only: stacked backdrop-filters are the most GPU-expensive thing on the
 * page, and phones don't have the hover/scroll-chrome context that motivates it.
 * pointer-events-none so it never intercepts clicks; aria-hidden (decorative).
 */

const LAYERS = 6

type GradualBlurProps = {
  edge?: 'top' | 'bottom'
  /** Height utility (Tailwind), e.g. 'h-28' (top) or a softer 'h-20' (bottom). */
  heightClass?: string
  /** Peak blur in px at the framed edge. */
  maxBlur?: number
}

export function GradualBlur({
  edge = 'top',
  heightClass = 'h-28',
  maxBlur = 16,
}: GradualBlurProps) {
  const isTop = edge === 'top'
  // Layers ramp toward the framed edge: `to top` frames the top, `to bottom`
  // frames the bottom. Blur is derived so the peak lands at `maxBlur`.
  const dir = isTop ? 'to top' : 'to bottom'
  const base = maxBlur / 2 ** (LAYERS - 1)

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 z-50 hidden ${heightClass} ${isTop ? 'top-0' : 'bottom-0'} md:block`}
    >
      {/* Faint tint under the frost so content near the edge keeps contrast. */}
      <div
        className={`absolute inset-0 ${
          isTop
            ? 'bg-gradient-to-b from-[color:var(--bg)]/55 to-transparent'
            : 'bg-gradient-to-t from-[color:var(--bg)]/40 to-transparent'
        }`}
      />

      {Array.from({ length: LAYERS }).map((_, i) => {
        const blur = base * 2 ** i
        const a = i * 12.5
        const mask = `linear-gradient(${dir}, rgba(0,0,0,0) ${a}%, rgba(0,0,0,1) ${a + 12.5}%, rgba(0,0,0,1) ${a + 25}%, rgba(0,0,0,0) ${a + 37.5}%)`
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
