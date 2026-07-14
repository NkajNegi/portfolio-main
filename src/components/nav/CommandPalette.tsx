import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  FileText,
  Folder,
  Home,
  Mail,
  Moon,
  PenLine,
  Search,
  User,
  Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType } from 'react'

import { useTheme } from '@/app/useTheme'
import { GitHubIcon, LinkedInIcon } from '@/components/icons/Brand'
import { site } from '@/content/site'

type Action = {
  id: string
  label: string
  group: string
  icon: ComponentType<{ className?: string }>
  perform: () => void
}

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function CommandPalette() {
  const { toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const actions = useMemo<Action[]>(() => {
    const nav: Action[] = [
      { id: 'top', label: 'Home', group: 'Navigate', icon: Home, perform: () => go('top') },
      { id: 'about', label: 'About', group: 'Navigate', icon: User, perform: () => go('about') },
      {
        id: 'experience',
        label: 'Experience',
        group: 'Navigate',
        icon: Briefcase,
        perform: () => go('experience'),
      },
      {
        id: 'projects',
        label: 'Projects',
        group: 'Navigate',
        icon: Folder,
        perform: () => go('projects'),
      },
      { id: 'skills', label: 'Skills', group: 'Navigate', icon: Wrench, perform: () => go('skills') },
      {
        id: 'writing',
        label: 'Writing',
        group: 'Navigate',
        icon: PenLine,
        perform: () => go('writing'),
      },
      { id: 'contact', label: 'Contact', group: 'Navigate', icon: Mail, perform: () => go('contact') },
    ]
    const links: Action[] = [
      {
        id: 'github',
        label: 'GitHub',
        group: 'Links',
        icon: GitHubIcon,
        perform: () => window.open(`https://github.com/${site.github}`, '_blank'),
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        group: 'Links',
        icon: LinkedInIcon,
        perform: () => window.open(site.linkedin, '_blank'),
      },
      {
        id: 'email',
        label: 'Email me',
        group: 'Links',
        icon: Mail,
        perform: () => window.open(`mailto:${site.email}`),
      },
      {
        id: 'resume',
        label: 'Open resume',
        group: 'Links',
        icon: FileText,
        perform: () => window.open(site.resumeHref, '_blank'),
      },
    ]
    const settings: Action[] = [
      { id: 'theme', label: 'Toggle theme', group: 'Settings', icon: Moon, perform: toggle },
    ]
    return [...nav, ...links, ...settings]
  }, [toggle])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q))
  }, [actions, query])

  // Global shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  function run(a: Action) {
    a.perform()
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const a = filtered[active]
      if (a) run(a)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="surface w-full max-w-lg overflow-hidden rounded-card border-none bg-[color:var(--bg)]/95 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[color:var(--surface-border)] px-5 py-4">
              <Search className="h-5 w-5 text-[color:var(--text-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                className="flex-1 border-none bg-transparent text-base font-medium text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-muted)]"
              />
              <kbd className="rounded bg-[color:var(--surface)] px-2 py-1 text-xs font-bold text-[color:var(--text-muted)]">
                ESC
              </kbd>
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-[color:var(--text-muted)]">
                  No results.
                </li>
              )}
              {filtered.map((a, i) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(a)}
                    className={`flex w-full items-center gap-3 rounded-control px-4 py-3 text-left text-[color:var(--text)] transition-colors ${
                      i === active ? 'bg-[color:var(--surface)]' : ''
                    }`}
                  >
                    <a.icon className="h-4 w-4 text-[color:var(--brand-2)]" />
                    <span className="flex-1 text-sm font-bold">{a.label}</span>
                    <span className="text-xs font-medium text-[color:var(--text-muted)]">{a.group}</span>
                    {i === active && <ArrowRight className="h-4 w-4 text-[color:var(--text-muted)]" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
