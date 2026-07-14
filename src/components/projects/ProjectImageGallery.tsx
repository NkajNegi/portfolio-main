import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function hostnameOf(url?: string) {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export function ProjectImageGallery({
  images,
  title,
  url,
}: {
  images: string[]
  title: string
  url?: string
}) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const next = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % images.length)
  }
  const prev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  // Lightbox: lock page scroll, close on Escape, move focus to the close button.
  useEffect(() => {
    if (!lightbox) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  }

  const label = hostnameOf(url) ?? title

  return (
    <div className="group/gallery overflow-hidden rounded-card border border-[color:var(--surface-border)] bg-black/40">
      {/* Browser chrome: turns a bare screenshot into a "product shot". Kept
          dark in both themes, matching the hero terminal. */}
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/30 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-2 min-w-0 flex-1 truncate rounded-full bg-white/5 px-3 py-1 text-center text-[11px] font-medium text-white/50">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={`View ${title} screenshot full size`}
          className="shrink-0 rounded-md p-1 text-white/50 transition-colors hover:text-white"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Screenshot viewport: fixed 16:10, swipeable (grab cursor = the affordance). */}
      <div className="relative aspect-[16/10] w-full cursor-grab overflow-hidden active:cursor-grabbing">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            src={images[index]}
            alt={`${title} screenshot ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full select-none object-cover transition-transform duration-500 group-hover/gallery:scale-[1.02]"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80) prev()
              else if (info.offset.x < -80) next()
            }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <div className="absolute inset-0 z-10 hidden items-center justify-between p-6 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
                className="surface flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-90"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
                className="surface flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-90"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1)
                    setIndex(i)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-8 bg-[color:var(--brand-2)]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox: full-size viewing in a portal (Esc / backdrop / X to close). */}
      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${title} screenshots`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightbox(false)}
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-10"
            >
              <motion.img
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                src={images[index]}
                alt={`${title} screenshot ${index + 1} (full size)`}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[88vh] max-w-full rounded-control object-contain shadow-2xl"
              />

              <button
                ref={closeRef}
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close full size view"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
              >
                <X className="h-5 w-5" />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    aria-label="Previous screenshot"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    aria-label="Next screenshot"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tabular-nums text-white/80 sm:bottom-6">
                    {index + 1} / {images.length}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
