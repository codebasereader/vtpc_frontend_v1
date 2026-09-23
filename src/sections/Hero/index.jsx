export default function Hero({ title, subtitle }) {
  return (
    <section
      className="relative h-[calc(100svh-11rem)] min-h-[420px] w-full overflow-hidden sm:min-h-[520px]"
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
