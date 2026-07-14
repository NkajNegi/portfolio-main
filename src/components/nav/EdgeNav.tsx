import { AnimatePresence, motion } from 'framer-motion'
import { Command, Menu, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { site } from '@/content/site'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Writing', href: '#writing' },
  { label: 'Contact', href: '#contact' },
] as const

const COLLAPSED = 64

// Open the command palette by simulating its Cmd/Ctrl+K shortcut.
function openCommandPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))
}

export function EdgeNav() {
  const [isOpen, setIsOpen] = useState(false) // mobile menu
  const [hovered, setHovered] = useState(false) // desktop expand
  const [focused, setFocused] = useState(false)
  const [fullWidth, setFullWidth] = useState(COLLAPSED)
  const innerRef = useRef<HTMLDivElement>(null)

  // Measure the expanded width once (and on resize) so we can animate between
  // two fixed pixel values -> smooth, no width:'auto' layout jank.
  useLayoutEffect(() => {
    const measure = () => {
      if (innerRef.current) setFullWidth(innerRef.current.scrollWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const expanded = hovered || focused

  return (
    <>
      {/* Desktop: FAB that expands on hover/focus (animates between fixed widths) */}
      <motion.nav
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false)
        }}
        initial={false}
        animate={{ width: expanded ? fullWidth : COLLAPSED }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'width' }}
        className="surface fixed right-6 top-6 z-[60] hidden h-16 items-center justify-end overflow-hidden rounded-full border-none lg:right-8 lg:top-8 md:flex"
        aria-label="Primary"
      >
        <div ref={innerRef} className="flex items-center">
          <motion.div
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-5 whitespace-nowrap pl-7 pr-3"
          >
            <a href="#top" className="text-lg font-black tracking-tight text-[color:var(--text)]">
              {site.name[0]}
              <span className="text-[color:var(--brand-2)]">.</span>
            </a>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-underline text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Open command palette"
              className="flex items-center gap-1 rounded-full bg-[color:var(--surface)] px-3 py-1.5 text-xs font-bold text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)]"
            >
              <Command className="h-3.5 w-3.5" />K
            </button>
          </motion.div>

          {/* Menu icon stays pinned on the right (always visible when collapsed) */}
          <span className="flex h-16 w-16 shrink-0 items-center justify-center text-[color:var(--text)]">
            <Menu size={22} />
          </span>
        </div>
      </motion.nav>

      {/* Mobile: burger button */}
      <div className="fixed right-5 top-5 z-[80] md:hidden">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen((o) => !o)}
          className="surface flex h-14 w-14 items-center justify-center rounded-control border-none text-[color:var(--text)]"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </motion.button>
      </div>

      {/* Mobile: fullscreen overlay (opacity-only animation + static blur = smooth) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[color:var(--bg)]/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col items-center gap-7">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-black tracking-tight text-[color:var(--text)] transition-colors hover:text-[color:var(--brand-2)]"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
