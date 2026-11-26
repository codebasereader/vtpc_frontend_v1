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
  ArrowRight,
  Leaf,
  Hammer,
  Award,
  Factory,
  UtensilsCrossed,
} from 'lucide-react'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { geographicalIndications as t } from '../../../language/geographicalIndications'
import { getGiProducts } from '../../../api/giProductsApi'
import { GI_CATEGORIES } from '../../../constants/giCategories'
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

// "What is GI?" opens this PDF in a new tab.
const WHAT_IS_GI_PDF_URL = '/assets/pdf/What-is-GI.pdf'

export default function GeographicalIndications() {
  const language = useSelector(selectLanguage)
  const [activeSlide, setActiveSlide] = useState(0)
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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-dark/80 via-brand-navy-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <h1 className="max-w-2xl text-3xl leading-tight font-extrabold text-white md:text-4xl lg:text-[2.85rem]">
            {t.hero.headingPrefix[language]}
            <span className="text-brand-gold">{t.hero.headingHighlight[language]}</span>
            {t.hero.headingSuffix[language]}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            {t.hero.description[language]}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {WHAT_IS_GI_PDF_URL && (
              <a
                href={WHAT_IS_GI_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/80 px-6 py-[10px] text-sm font-bold text-white transition-colors hover:bg-white hover:text-brand-navy-dark"
              >
                {t.coffeeHub.whatIsGi[language]}
              </a>
            )}
            <a
              href="#gi-coffee-hub"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(200,55,68,0.35)] transition-all hover:-translate-y-0.5 hover:bg-brand-primary-dark hover:shadow-[0_14px_30px_rgba(200,55,68,0.45)]"
            >
              {t.hero.cta[language]}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

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
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* At the Forefront */}
      <ForefrontSection language={language} products={giProducts} />

      {/* Karnataka's GI Treasures */}
      <GITreasures products={giProducts} isLoading={isLoadingProducts} />

      {/* Artisanal Stories */}
      <ArtisanalStories products={giProducts} isLoading={isLoadingProducts} />
    </>
  )
}

// Which product category each counter reflects. Counters without an entry (GI Logos) are not
// derived from products and keep the fixed value from the language file.
const STAT_CATEGORY_IDS = {
  agriculturalGis: 'agricultural',
  handicraftGis: 'handicrafts',
  manufacturedGoods: 'manufactured',
  foodStuff: 'food',
}

// Live count from the product list; falls back to the fixed value while products are still
// loading or if they could not be loaded, so the counters never flash zero.
function withLiveValue(stat, products) {
  const category = GI_CATEGORIES.find((c) => c.id === STAT_CATEGORY_IDS[stat.key])
  if (!category || products.length === 0) return stat
  return { ...stat, value: products.filter((product) => product.category === category.en).length }
}

function ForefrontSection({ language, products }) {
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
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/80 via-brand-primary-dark/55 to-brand-navy-dark/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-2xl leading-tight font-bold text-white md:text-3xl lg:text-[2.1rem]">
          {t.forefront.heading[language]}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {t.forefront.stats.map((stat) => (
            <StatCard
              key={stat.key}
              stat={withLiveValue(stat, products)}
              language={language}
              animate={hasAnimated}
            />
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
