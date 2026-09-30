export default function Hero({ title, subtitle }) {
  return (
    <section
      className="relative min-h-0 w-full flex-1 overflow-hidden"
      aria-label={title}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/assets/video/bannerVideo.webm"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Keep title/subtitle for SEO and tests; visually the hero is video-only. */}
      <h1 className="sr-only">{title}</h1>
      {subtitle ? <p className="sr-only">{subtitle}</p> : null}
    </section>
  )
}
