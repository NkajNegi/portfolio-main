import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { useTheme } from '@/app/useTheme'
import { TiltCard } from '@/components/motion/TiltCard'
import { site } from '@/content/site'

type Entry = { command?: string; lines: ReactNode[] }

const HELP: ReactNode[] = [
  'Available commands:',
  '  help        show this list',
  '  whoami      a quick intro',
  '  skills      core tech stack',
  '  projects    selected work',
  '  experience  work history',
  '  social      where to find me',
  '  contact     get in touch',
  '  resume      open my resume',
  '  theme       toggle light / dark',
  '  clear       clear the screen',
]

const SKILLS = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="text-[color:var(--brand-2)] underline-offset-2 hover:underline"
    >
      {children}
    </a>
  )
}

export function HeroTerminal() {
  const { toggle } = useTheme()
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<Entry[]>([
    {
      lines: [
        `Hi, I'm ${site.name} — ${site.headline}.`,
        'Type a command to explore. Try "help".',
      ],
    },
  ])
  const [pastCmds, setPastCmds] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [entries])

  function resolve(raw: string): ReactNode[] | 'CLEAR' {
    const cmd = raw.trim().toLowerCase()
    switch (cmd) {
      case '':
        return []
      case 'help':
        return HELP
      case 'whoami':
        return [`${site.name} · ${site.headline} · ${site.location}`, site.about.summary]
      case 'skills':
        return [SKILLS.join('  ·  ')]
      case 'projects':
        return site.projects.map((p) => `• ${p.title} — ${p.impact}`)
      case 'experience':
        return site.experience.map((e) => `• ${e.role} @ ${e.company} (${e.start}–${e.end})`)
      case 'social':
      case 'socials':
        return site.socials.map((s) => (
          <span key={s.href}>
            {s.label}: <Link href={s.href}>{s.href}</Link>
          </span>
        ))
      case 'contact':
        return [
          <span key="email">
            Email: <Link href={`mailto:${site.email}`}>{site.email}</Link>
          </span>,
        ]
      case 'resume':
        window.open(site.resumeHref, '_blank')
        return ['Opening resume…']
      case 'theme':
        toggle()
        return ['Toggled theme.']
      case 'clear':
        return 'CLEAR'
      default:
        return [`command not found: ${cmd}. Type "help".`]
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = resolve(input)
    if (result === 'CLEAR') {
      setEntries([])
    } else {
      setEntries((prev) => [...prev, { command: input, lines: result }])
    }
    if (input.trim()) setPastCmds((prev) => [...prev, input])
    setHistIdx(-1)
    setInput('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!pastCmds.length) return
      const next = histIdx === -1 ? pastCmds.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(next)
      setInput(pastCmds[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const next = histIdx + 1
      if (next >= pastCmds.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(next)
        setInput(pastCmds[next] ?? '')
      }
    }
  }

  return (
    <TiltCard
      maxTilt={4}
      cardScale={1.01}
      glare={false}
      className="surface w-full overflow-hidden rounded-card border-none bg-black/30 text-left shadow-2xl backdrop-blur-xl"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[color:var(--surface-border)] bg-[color:var(--surface)] px-5 py-3.5">
        <div className="h-3 w-3 rounded-full bg-rose-500" />
        <div className="h-3 w-3 rounded-full bg-amber-400" />
        <div className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 font-mono text-xs font-medium text-[color:var(--text-muted)]">
          {`guest@${site.name.toLowerCase().replace(/\s+/g, '')}: ~`}
        </span>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="h-[320px] overflow-y-auto p-5 font-mono text-[13px] leading-relaxed text-[color:var(--text)] [&::-webkit-scrollbar]:hidden md:text-sm"
      >
        {entries.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.command !== undefined && (
              <div className="text-[color:var(--text-muted)]">
                <span className="text-[color:var(--brand-2)]">$</span> {entry.command}
              </div>
            )}
            {entry.lines.map((line, j) => (
              <div key={j} className="whitespace-pre-wrap text-[color:var(--text-muted)]">
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Prompt */}
        <form onSubmit={submit} className="flex items-center gap-2">
          <span className="text-[color:var(--brand-2)]">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
            className="flex-1 border-none bg-transparent font-mono text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-muted)]"
            placeholder="type a command…"
          />
        </form>
      </div>
    </TiltCard>
  )
}
