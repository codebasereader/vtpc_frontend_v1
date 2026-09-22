import heroVideo from '../../assets/videos/hero-banner.mp4'

export default function Hero({ title, subtitle }) {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden text-center text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-brand-dark/50" />
      <div className="relative z-10 px-4 py-16 md:px-8">
        <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 text-base md:text-lg">{subtitle}</p>
      </div>
    </section>
  )
}
