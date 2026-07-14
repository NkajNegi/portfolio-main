import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'dark' | 'light'

const storageKey = 'theme'

function getPreferredTheme(): Theme {
  const saved = window.localStorage.getItem(storageKey)
  if (saved === 'light' || saved === 'dark') return saved
  const prefersLight =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return getPreferredTheme()
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.classList.add('light')
    else root.classList.remove('light')

    window.localStorage.setItem(storageKey, theme)
  }, [theme])

  /**
   * Toggle the theme with a radial "wipe" from the click point, using the
   * View Transitions API. Falls back to an instant switch in browsers without
   * support and for reduced-motion users. Pass the click coordinates from the
   * triggering event; omitting them wipes from the screen centre.
   */
  const toggle = useMemo(() => {
    return (x?: number, y?: number) => {
      const flip = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

      if (!document.startViewTransition || prefersReducedMotion()) {
        flip()
        return
      }

      const cx = x ?? window.innerWidth / 2
      const cy = y ?? window.innerHeight / 2
      // Radius to the farthest viewport corner so the circle covers everything.
      const radius = Math.hypot(
        Math.max(cx, window.innerWidth - cx),
        Math.max(cy, window.innerHeight - cy),
      )

      const transition = document.startViewTransition(() => {
        // flushSync so the DOM is fully re-themed inside the snapshot callback.
        flushSync(flip)
      })

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`],
          },
          {
            duration: 550,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
    }
  }, [])

  return { theme, setTheme, toggle }
}
