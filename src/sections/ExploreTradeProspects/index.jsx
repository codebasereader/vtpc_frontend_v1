import { useLayoutEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Factory, Lightbulb, Sprout, MapPin } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'
import { splitHighlight } from '../../lib/text'

const BANNER = '/assets/images/explore-trade/exploretrade.png'

const CARD_META = [
  { image: '/assets/images/explore-trade/diverseeconomy.png', icon: Factory, iconBg: 'bg-[#2f6fed]' },
  { image: '/assets/images/explore-trade/innovationhub.png', icon: Lightbulb, iconBg: 'bg-brand-primary' },
  { image: '/assets/images/explore-trade/agricultural-bounty.png', icon: Sprout, iconBg: 'bg-[#2f9e5a]' },
  { image: '/assets/images/explore-trade/strategic-location.png', icon: MapPin, iconBg: 'bg-[#e67a2e]' },
]

export default function ExploreTradeProspects() {
  const language = useSelector(selectLanguage)
  const t = home.exploreTradeProspects
  const sectionRef = useRef(null)
  const cardsRef = useRef(null)
  const [bannerHeight, setBannerHeight] = useState('60%')

  useLayoutEffect(() => {
    const updateBannerHeight = () => {
      const section = sectionRef.current
      const cards = cardsRef.current
      if (!section || !cards) return

      const sectionTop = section.getBoundingClientRect().top
      const cardsRect = cards.getBoundingClientRect()
      // Banner from section top → halfway down the cards
      const height = cardsRect.top - sectionTop + cardsRect.height / 2
      setBannerHeight(`${Math.max(height, 0)}px`)
    }

    updateBannerHeight()

    const observer = new ResizeObserver(updateBannerHeight)
    if (sectionRef.current) observer.observe(sectionRef.current)
    if (cardsRef.current) observer.observe(cardsRef.current)
    window.addEventListener('resize', updateBannerHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateBannerHeight)
    }
  }, [])

  const [titleBefore, titleHighlight, titleAfter] = splitHighlight(
    t.title[language],
    t.titleHighlight[language]
  )

  return (
    <section ref={sectionRef} className="relative overflow-x-clip bg-[#f4f4f4] pb-14 md:pb-20">
      {/* Banner starts at the very top of this section — no grey gap above the heading */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
        style={{ height: bannerHeight }}
        aria-hidden="true"
      >
        <img
          src={BANNER}
          alt=""
          className="h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-brand-primary/50" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 md:px-8 md:pt-16">
        <h2 className="max-w-3xl text-3xl font-bold text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {titleBefore}
          {titleHighlight && <span className="text-brand-gold">{titleHighlight}</span>}
          {titleAfter}
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/95 md:text-lg">
          {t.description[language]}
        </p>

        <div
          ref={cardsRef}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {t.cards.map((card, index) => {
            const { image, icon: Icon, iconBg } = CARD_META[index]
            return (
              <article
                key={card.title.en}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
              >
                <div className="relative h-40 shrink-0 sm:h-44">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                  <svg
                    className="absolute inset-x-0 bottom-0 h-10 w-full text-white"
                    viewBox="0 0 400 40"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 18 C70 38 130 2 200 18 C270 34 330 6 400 20 L400 40 L0 40 Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span
                    className={`absolute bottom-2 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-md ${iconBg}`}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-5 pt-4 pb-6">
                  <h3 className="text-xl font-bold text-brand-dark">{card.title[language]}</h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-600">{card.description[language]}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
