import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#$%&@'

type ScrambleTextProps = {
  text: string
  /** Seconds before the decode starts. */
  delay?: number
  /** Total decode time in seconds. */
  duration?: number
  className?: string
}

/**
 * Terminal-style decode effect: characters flicker through random glyphs and
 * lock in left-to-right. Reduced-motion users see the final text immediately.
 * Screen readers always get the real string (aria-label).
 */
export function ScrambleText({ text, delay = 0, duration = 1.1, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)
  const frame = useRef(0)

  useEffect(() => {
    // State initializes to the final text, so reduced-motion needs no work.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let raf = 0
    let start: number | null = null
    const totalMs = duration * 1000

    const tick = (now: number) => {
      if (start === null) start = now + delay * 1000
      const elapsed = now - start

      if (elapsed < 0) {
        // Still in the delay window — show pure noise.
        if (frame.current % 3 === 0) {
          setDisplay(
            [...text]
              .map((c) => (c === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
              .join(''),
          )
        }
      } else {
        const lockedCount = Math.floor((elapsed / totalMs) * text.length)
        if (lockedCount >= text.length) {
          setDisplay(text)
          return
        }
        if (frame.current % 2 === 0) {
          setDisplay(
            [...text]
              .map((c, i) => {
                if (i < lockedCount || c === ' ') return c
                return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
              })
              .join(''),
          )
        }
      }

      frame.current++
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, delay, duration])

  return (
    <span aria-label={text} className={className}>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
