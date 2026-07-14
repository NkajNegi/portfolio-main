import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'

import { site } from '@/content/site'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const PLACEHOLDER_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const configured = site.web3formsKey && site.web3formsKey !== PLACEHOLDER_KEY

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)
    data.append('access_key', site.web3formsKey)
    data.append('subject', `New message from your portfolio`)
    data.append('from_name', site.name)

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      })
      const json = await res.json()
      if (json.success) {
        setStatus('success')
        form.reset()
      } else {
        throw new Error(json.message || 'Submission failed')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="surface flex flex-col items-center gap-3 rounded-card border-none p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-3xl">
          ✓
        </span>
        <h3 className="m-0 text-2xl font-bold text-[color:var(--text)]">Message sent!</h3>
        <p className="m-0 text-[color:var(--text-muted)]">
          Thanks for reaching out — I’ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="glass-button mt-2 rounded-full px-6 py-2.5 text-sm font-bold text-[color:var(--text)]"
        >
          Send another
        </button>
      </div>
    )
  }

  const inputCls =
    'w-full rounded-control border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-5 py-4 text-base font-medium text-[color:var(--text)] outline-none transition-all placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-2)] focus:ring-4 focus:ring-cyan-500/20'

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-left">
      {/* Honeypot for spam bots */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="cf-name" className="text-sm font-bold text-[color:var(--text)]">
            Name
          </label>
          <input id="cf-name" name="name" required placeholder="Your name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cf-email" className="text-sm font-bold text-[color:var(--text)]">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="cf-message" className="text-sm font-bold text-[color:var(--text)]">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project or opportunity…"
          className={`${inputCls} resize-y`}
        />
      </div>

      {!configured && (
        <p className="m-0 rounded-control bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-500">
          Heads up: add your Web3Forms access key in{' '}
          <code className="font-bold">src/content/site.ts</code> to receive submissions.
        </p>
      )}

      {status === 'error' && (
        <p className="m-0 rounded-control bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-400">
          {error || 'Could not send. Please try again or email me directly.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting' || !configured}
        className="btn-accent group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send message
            <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  )
}
