import type { ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={['mx-auto w-[min(1120px,calc(100%-48px))]', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
