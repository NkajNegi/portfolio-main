import { GitFork, Star, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { GitHubIcon } from '@/components/icons/Brand'
import { CountUp } from '@/components/motion/CountUp'
import { site } from '@/content/site'

type Stats = {
  repos: number
  stars: number
  followers: number
  following: number
  profileUrl: string
}

type State =
  | { status: 'loading' }
  | { status: 'unset' }
  | { status: 'error' }
  | { status: 'ready'; stats: Stats }

const PLACEHOLDER = 'your-github-username'

export function GitHubStats() {
  const username = site.github
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!username || (username as string) === PLACEHOLDER) {
      setState({ status: 'unset' })
      return
    }

    let cancelled = false

    async function load() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
        ])
        if (!userRes.ok) throw new Error('user not found')

        const user = await userRes.json()
        const repos: Array<{ stargazers_count?: number }> = reposRes.ok
          ? await reposRes.json()
          : []
        const stars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0)

        if (cancelled) return
        setState({
          status: 'ready',
          stats: {
            repos: user.public_repos ?? 0,
            stars,
            followers: user.followers ?? 0,
            following: user.following ?? 0,
            profileUrl: user.html_url ?? `https://github.com/${username}`,
          },
        })
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [username])

  if (state.status === 'unset') {
    return (
      <div className="surface rounded-card border-none p-6 text-sm font-medium text-[color:var(--text-muted)]">
        Add your GitHub username in{' '}
        <code className="rounded bg-[color:var(--surface)] px-1.5 py-0.5 text-[color:var(--text)]">
          src/content/site.ts
        </code>{' '}
        to show live stats here.
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="surface rounded-card border-none p-6 text-sm font-medium text-[color:var(--text-muted)]">
        Couldn’t load GitHub stats right now.{' '}
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-[color:var(--brand-2)] hover:underline"
        >
          View profile →
        </a>
      </div>
    )
  }

  const loading = state.status === 'loading'
  const items = [
    { icon: GitFork, label: 'Repositories', value: loading ? null : state.stats.repos },
    { icon: Star, label: 'Total Stars', value: loading ? null : state.stats.stars },
    { icon: Users, label: 'Followers', value: loading ? null : state.stats.followers },
    { icon: GitHubIcon, label: 'Following', value: loading ? null : state.stats.following },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="surface flex flex-col gap-1 rounded-control border-none p-4 sm:p-5"
          >
            <Icon className="h-5 w-5 text-[color:var(--brand-2)]" />
            <span className="mt-1 text-2xl font-black tracking-tight text-[color:var(--text)] sm:text-3xl">
              {value === null ? (
                <span className="inline-block h-7 w-12 animate-pulse rounded bg-[color:var(--surface)]" />
              ) : (
                <CountUp value={value} />
              )}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
              {label}
            </span>
          </div>
        ))}
      </div>
      {state.status === 'ready' && (
        <a
          href={state.stats.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="glass-button inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[color:var(--text)]"
        >
          <GitHubIcon className="h-4 w-4" />
          View GitHub profile
        </a>
      )}
    </div>
  )
}
