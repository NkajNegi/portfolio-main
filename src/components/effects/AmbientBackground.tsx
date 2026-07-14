/**
 * Fixed ambient layer behind the whole page: a faint two-hue gradient wash plus
 * a film-grain texture for a premium, less "flat digital" feel.
 *
 * The wash lives here on a position:fixed layer rather than as
 * `background-attachment: fixed` on <body> — same viewport-anchored look, but a
 * compositing layer instead of a repaint-on-every-scroll-frame background.
 *
 * Deliberately the *only* always-on ambient element (the drifting aurora blobs
 * were removed); the hero keeps its own animated mesh. Purely decorative:
 * aria-hidden and pointer-events-none.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-wash absolute inset-0" />
      <div className="grain absolute inset-0 opacity-[0.035]" />
    </div>
  )
}
