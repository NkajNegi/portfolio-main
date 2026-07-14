type SkipLinkProps = {
  targetId: string
  label?: string
}

export function SkipLink({ targetId, label = 'Skip to content' }: SkipLinkProps) {
  return (
    <a
      className={[
        'surface absolute left-4 top-4 z-[100] rounded-control px-6 py-3 font-bold',
        '-translate-y-[200%] transition-transform duration-300 ease-out focus:translate-y-0',
      ].join(' ')}
      href={`#${targetId}`}
    >
      {label}
    </a>
  )
}
