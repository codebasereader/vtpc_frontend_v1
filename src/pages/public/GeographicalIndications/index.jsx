import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import {
  Sparkles,
  Coffee,
  ShieldCheck,
  TrendingUp,
  Shirt,
  Landmark,
  Trophy,
  ChevronRight,
  ArrowRight,
  X,
  Leaf,
  Hammer,
  Award,
  Factory,
  UtensilsCrossed,
} from 'lucide-react'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { geographicalIndications as t } from '../../../language/geographicalIndications'
import { getGiProducts } from '../../../api/giProductsApi'
import GITreasures from '../../../sections/GITreasures'
import ArtisanalStories from '../../../sections/ArtisanalStories'

const HERO_IMAGES = [
  '/assets/images/gi/hero/GiBanner1.webp',
  '/assets/images/gi/hero/GiBanner2.webp',
  '/assets/images/gi/hero/GiBanner3.webp',
  '/assets/images/gi/hero/GiBanner4.webp',
]

const FOREFRONT_IMAGE = '/assets/images/gi/At the Forefront.webp'

const CARD_ICONS = {
  exquisiteProducts: Sparkles,
  coffeeExcellence: Coffee,
  firstInPolicy: ShieldCheck,
  mysoreGiHub: TrendingUp,
  mysoreSilkLegacy: Shirt,
  centuryOfHeritage: Landmark,
  sweetSuccess: Trophy,
}

const STAT_ICONS = {
  agriculturalGis: Leaf,
  handicraftGis: Hammer,
  giLogos: Award,
  manufacturedGoods: Factory,
  foodStuff: UtensilsCrossed,
}

const HERO_INTERVAL_MS = 5000

export default function GeographicalIndications() {
  const language = useSelector(selectLanguage)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isGiModalOpen, setIsGiModalOpen] = useState(false)
  const [giProducts, setGiProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, HERO_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let isMounted = true
    getGiProducts()
      .then((data) => {
        if (isMounted) setGiProducts(data)
      })
      .catch(() => {
        if (isMounted) setGiProducts([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingProducts(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>{t.pageTitle[language]} — VTPC Karnataka</title>
        <meta name="description" content={t.hero.description[language]} />
      </Helmet>

      {/* Hero — auto-rotating background images with overlay + copy */}
      <section className="relative isolate flex min-h-[560px] items-center overflow-hidden md:min-h-[620px]">
        {HERO_IMAGES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            fetchPriority={index === 0 ? 'high' : 'low'}
            decoding="async"
            className={`absolute inset-0 h-full w-full transform-gpu object-cover transition-opacity duration-[1500ms] ease-in-out ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-dark/95 via-brand-navy-dark/75 to-brand-navy-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <h1 className="max-w-2xl text-3xl leading-tight font-extrabold text-white md:text-4xl lg:text-[2.85rem]">
            {t.hero.headingPrefix[language]}
            <span className="text-brand-gold">{t.hero.headingHighlight[language]}</span>
            {t.hero.headingSuffix[language]}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            {t.hero.description[language]}
          </p>

          <a
            href="#gi-coffee-hub"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(200,55,68,0.35)] transition-all hover:-translate-y-0.5 hover:bg-brand-primary-dark hover:shadow-[0_14px_30px_rgba(200,55,68,0.45)]"
          >
            {t.hero.cta[language]}
            <ArrowRight size={16} aria-hidden="true" />
          </a>

          {/* Slide indicators */}
          <div className="mt-12 flex items-center gap-2">
            {HERO_IMAGES.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeSlide ? 'w-8 bg-brand-gold' : 'w-4 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Karnataka: The GI Coffee Hub of India */}
      <section id="gi-coffee-hub" className="relative overflow-hidden bg-brand-page px-4 py-16 md:px-8 md:py-20">
        <div
          className="pointer-events-none absolute top-0 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,var(--color-brand-surface),transparent)] opacity-80"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl lg:text-[2rem]">
              {t.coffeeHub.heading[language]}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">{t.coffeeHub.description[language]}</p>
            <button
              type="button"
              onClick={() => setIsGiModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-brand-primary px-5 py-2.5 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
            >
              {t.coffeeHub.whatIsGi[language]}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.coffeeHub.cards.map((card, index) => {
              const Icon = CARD_ICONS[card.key]
              const isLast = index === t.coffeeHub.cards.length - 1
              return (
                <div
                  key={card.key}
                  className={`group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-[0_6px_18px_rgba(15,40,80,0.06)] ring-1 ring-brand-divider/60 transition-all hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,40,80,0.12)] ${
                    isLast ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-brand-navy-dark">{card.title[language]}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{card.description[language]}</p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="mt-1 shrink-0 text-brand-divider transition-all group-hover:translate-x-1 group-hover:text-brand-primary"
                    aria-hidden="true"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What is GI? modal */}
      {isGiModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gi-modal-title"
          onClick={() => setIsGiModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsGiModalOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-brand-page hover:text-brand-navy-dark"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <h3 id="gi-modal-title" className="pr-8 text-lg font-bold text-brand-navy-dark">
              {t.coffeeHub.whatIsGi[language]}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{t.coffeeHub.whatIsGiText[language]}</p>
          </div>
        </div>
      )}

      {/* At the Forefront */}
      <ForefrontSection language={language} />

      {/* Karnataka's GI Treasures */}
      <GITreasures products={giProducts} isLoading={isLoadingProducts} />

      {/* Artisanal Stories */}
      <ArtisanalStories products={giProducts} isLoading={isLoadingProducts} />
    </>
  )
}

function ForefrontSection({ language }) {
  const sectionRef = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-navy-dark bg-cover bg-center px-4 py-16 md:px-8 md:py-20"
      style={{ backgroundImage: `url(${encodeURI(FOREFRONT_IMAGE)})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/90 via-brand-primary-dark/80 to-brand-navy-dark/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-2xl leading-tight font-bold text-white md:text-3xl lg:text-[2.1rem]">
          {t.forefront.heading[language]}
        </h2>
        <p className="mt-2 max-w-xl text-base text-white/90">{t.forefront.description[language]}</p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {t.forefront.stats.map((stat) => (
            <StatCard key={stat.key} stat={stat} language={language} animate={hasAnimated} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, language, animate }) {
  const Icon = STAT_ICONS[stat.key]
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animate) return undefined
    const duration = 1200
    const start = performance.now()

    let frameId
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(Math.round(progress * stat.value))
      if (progress < 1) frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [animate, stat.value])

  const display = stat.display ? String(count).padStart(2, '0') : String(count)

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="text-2xl font-extrabold text-brand-navy-dark md:text-3xl">{display}</span>
      <span className="text-xs leading-snug font-semibold text-gray-500">{stat.label[language]}</span>
    </div>
  )
}
