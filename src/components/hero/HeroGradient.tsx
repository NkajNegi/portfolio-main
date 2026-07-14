import { useEffect, useRef } from 'react'

/**
 * Flowing mesh-gradient background for the hero — four color blobs orbiting
 * slowly on a tiny canvas that's upscaled and heavily blurred by CSS, which
 * reads like a WebGL shader at a fraction of the cost. Pauses when the hero
 * is off-screen; reduced-motion users get a single static frame.
 */

// Blob palette: the signature gradient's three hues only — violet, fuchsia,
// cyan (no off-palette blue). Alpha kept low — the glow comes from additive
// blending, not raw opacity.
const BLOBS = [
  { color: '139, 92, 246', speed: 0.21, phase: 0.0, r: 0.75 },
  { color: '6, 182, 212', speed: 0.17, phase: 2.1, r: 0.65 },
  { color: '217, 70, 239', speed: 0.13, phase: 4.2, r: 0.6 },
]

const W = 96
const H = 54

export function HeroGradient({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let visible = true

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (const blob of BLOBS) {
        const x = (0.5 + 0.38 * Math.sin(t * blob.speed + blob.phase)) * W
        const y = (0.5 + 0.38 * Math.cos(t * blob.speed * 0.8 + blob.phase * 1.3)) * H
        const radius = blob.r * W * 0.55
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
        g.addColorStop(0, `rgba(${blob.color}, 0.55)`)
        g.addColorStop(1, `rgba(${blob.color}, 0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }
    }

    if (reduced) {
      draw(1.5)
      return
    }

    const loop = (now: number) => {
      if (visible) draw(now / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Skip drawing while the hero is scrolled out of view.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="h-full w-full scale-110 opacity-50 blur-[60px] [.light_&]:opacity-35"
      />
      {/* Fade the bottom edge into the page background */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[color:var(--bg)]" />
    </div>
  )
}
