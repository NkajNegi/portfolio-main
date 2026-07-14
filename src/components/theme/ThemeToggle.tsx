import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/app/useTheme'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  return (
    <button
      type="button"
      // Pass the click point so the theme wipe expands from the button.
      onClick={(e) => toggle(e.clientX, e.clientY)}
      className={[
        'surface flex h-14 w-14 items-center justify-center rounded-control border-none',
        'text-[color:var(--text)] transition-all hover:scale-110 active:scale-90',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={24} className="text-amber-300" />
      ) : (
        <Moon size={24} className="text-indigo-600" />
      )}
    </button>
  )
}
