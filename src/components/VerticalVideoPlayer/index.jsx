import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'

/**
 * A portrait (9:16) video shown as a thumbnail card. Clicking it opens the video over the whole
 * screen (phones and laptops alike). The video keeps its own proportions, so the space left on
 * the sides of a landscape screen is filled with a soft blurred picture rather than black bars.
 *
 * Props: src, poster, backdrop (image for the side fill), title, playLabel, closeLabel
 */
export default function VerticalVideoPlayer({ src, poster, backdrop, title, playLabel, closeLabel }) {
  const [isOpen, setIsOpen] = useState(false)
  const overlayRef = useRef(null)
  const videoRef = useRef(null)

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    // Ask the browser for true full screen (hides the address bar on laptops); where that isn't
    // available (e.g. iPhone Safari) the fixed overlay below still covers the whole viewport.
    overlayRef.current?.requestFullscreen?.().catch(() => {})

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }
    // Leaving full screen with the browser's own Esc/back gesture also closes the player.
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    videoRef.current?.play().catch(() => {})

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, close])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`${playLabel}: ${title}`}
        className="group relative mx-auto block aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] ring-4 ring-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:max-w-[300px]"
      >
        <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg ring-4 ring-white/70 transition-transform group-hover:scale-110">
            <Play size={28} fill="currentColor" className="ml-1" aria-hidden="true" />
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-brand-navy-dark"
        >
          {/* Side fill: the heritage picture, blurred and dimmed — no black bars. */}
          {backdrop && (
            <img
              src={backdrop}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-75"
            />
          )}

          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            playsInline
            controlsList="nodownload"
            className="relative z-10 h-full max-h-dvh w-auto max-w-full bg-transparent object-contain"
          />

          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  )
}
