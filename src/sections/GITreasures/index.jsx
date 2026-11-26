import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ImageOff, Mail, Send, X } from 'lucide-react'
import { GI_CATEGORIES } from '../../constants/giCategories'
import { submitEnquiry } from '../../api/enquiriesApi'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { geographicalIndications as t } from '../../language/geographicalIndications'

// Featured is not a real `category` value — it's the cross-cutting
// `featured` boolean toggle set per-product in the admin (see
// src/constants/giCategories.js). This id is just a UI sentinel; it never
// has to match a real category string.
const FEATURED_TAB_ID = '__featured__'
const FEATURED_TAB = { id: FEATURED_TAB_ID, en: 'Featured Products', kn: 'ವಿಶೇಷ ಉತ್ಪನ್ನಗಳು' }

// Cards shown per tab before the "Show more" button reveals the next batch.
const PAGE_SIZE = 9

export default function GITreasures({ products, isLoading }) {
  const language = useSelector(selectLanguage)
  const [selectedTabId, setSelectedTabId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [detailProduct, setDetailProduct] = useState(null)
  const [enquiryProduct, setEnquiryProduct] = useState(null)

  const categoryCounts = useMemo(() => {
    const counts = new Map()
    products.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) || 0) + 1)
    })
    return counts
  }, [products])

  const featuredCount = useMemo(() => products.filter((product) => product.featured).length, [products])

  // The curated list drives the admin dropdown and keeps a stable tab
  // order; any category string actually present in the live data but not
  // in that curated list still gets its own tab, so nothing is ever
  // silently hidden just because `category` is free text on the backend.
  const tabs = useMemo(() => {
    const extras = [...categoryCounts.keys()]
      .filter((categoryEn) => categoryEn && !GI_CATEGORIES.some((c) => c.en === categoryEn))
      .map((categoryEn) => ({ id: categoryEn, en: categoryEn, kn: categoryEn }))
    return [FEATURED_TAB, ...GI_CATEGORIES, ...extras]
  }, [categoryCounts])

  function countFor(tab) {
    return tab.id === FEATURED_TAB_ID ? featuredCount : categoryCounts.get(tab.en) || 0
  }

  // Default to the first tab that actually has products, unless the
  // visitor has explicitly picked one themselves.
  const activeTabId = selectedTabId ?? tabs.find((tab) => countFor(tab) > 0)?.id ?? tabs[0].id
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]

  const categoryProducts = useMemo(
    () =>
      activeTabId === FEATURED_TAB_ID
        ? products.filter((product) => product.featured)
        : products.filter((product) => product.category === activeTab.en),
    [products, activeTabId, activeTab],
  )

  const visibleProducts = categoryProducts.slice(0, visibleCount)

  function handleSelectTab(tabId) {
    setSelectedTabId(tabId)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <section id="gi-treasures" className="bg-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl lg:text-[2rem]">
          {t.treasures.heading[language]}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">{t.treasures.description[language]}</p>

        {/* Category tabs — horizontal, scrollable on mobile */}
        <div className="mt-8 -mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <div className="flex w-max gap-2 md:w-full md:flex-wrap">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId
              const count = countFor(tab)
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-[0_8px_18px_rgba(200,55,68,0.3)]'
                      : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
                  }`}
                >
                  {tab[language]}
                  <span className={`ml-1.5 ${isActive ? 'text-white/75' : 'text-gray-400'}`}>({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product cards — every image sits in the same 4:3 frame (whole picture shown over a
            soft blurred copy of itself) so differently-shaped photos never get awkwardly cropped. */}
        <div className="mt-8">
          {isLoading && <p className="p-8 text-center text-gray-600">{t.treasures.loading[language]}</p>}

          {!isLoading && categoryProducts.length === 0 && (
            <p className="p-8 text-center text-gray-600">{t.treasures.empty[language]}</p>
          )}

          {!isLoading && categoryProducts.length > 0 && (
            <>
              <div key={activeTabId} className="animate-fade-slide-up grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    onOpen={() => setDetailProduct(product)}
                  />
                ))}
              </div>

              {visibleCount < categoryProducts.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-lg border-2 border-brand-primary px-6 py-2.5 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                  >
                    {t.treasures.showMore[language]} ({categoryProducts.length - visibleCount})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          language={language}
          onClose={() => setDetailProduct(null)}
          onEnquire={() => setEnquiryProduct(detailProduct)}
        />
      )}

      {enquiryProduct && (
        <EnquiryModal product={enquiryProduct} language={language} onClose={() => setEnquiryProduct(null)} />
      )}
    </section>
  )
}

// Fixed 4:3 frame. The whole photo is shown (object-contain) on top of a blurred, zoomed copy of
// itself, so portrait, landscape and square images all fill the frame without being cropped.
function ProductImage({ product, className = '' }) {
  if (!product.image) {
    return (
      <span className={`flex items-center justify-center bg-brand-surface text-gray-400 ${className}`}>
        <ImageOff size={32} aria-hidden="true" />
      </span>
    )
  }
  return (
    <div className={`relative overflow-hidden bg-brand-surface ${className}`}>
      <img
        src={product.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
      />
      <img
        src={product.image}
        alt={product.name?.en}
        loading="lazy"
        className="relative h-full w-full object-contain"
      />
    </div>
  )
}

function ProductCard({ product, language, onOpen }) {
  const name = product.name?.[language] || product.name?.en
  const summary = product.summary?.[language] || product.summary?.en
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_6px_18px_rgba(15,40,80,0.08)] ring-1 ring-brand-divider/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,40,80,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      <ProductImage product={product} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-primary">
          {product.category}
        </span>
        <h3 className="mt-3 text-lg font-bold text-brand-navy-dark">{name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{summary}</p>
        <span className="mt-4 text-sm font-bold text-brand-primary group-hover:underline">
          {t.treasures.viewDetails[language]}
        </span>
      </div>
    </button>
  )
}

function ProductDetailModal({ product, language, onClose, onEnquire }) {
  const name = product.name?.[language] || product.name?.en
  const summary = product.summary?.[language] || product.summary?.en

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gi-detail-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow transition-colors hover:text-brand-navy-dark"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="overflow-y-auto">
          <ProductImage product={product} className="aspect-[16/10] w-full" />
          <div className="p-6 md:p-8">
            <span className="w-fit rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-primary">
              {product.category}
            </span>
            <h3 id="gi-detail-title" className="mt-3 text-2xl font-bold text-brand-navy-dark">
              {name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">{summary}</p>
            <button
              type="button"
              onClick={onEnquire}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-primary-dark hover:shadow-[0_10px_24px_rgba(200,55,68,0.35)]"
            >
              <Mail size={15} aria-hidden="true" />
              {t.treasures.enquireNow[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnquiryModal({ product, language, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    try {
      await submitEnquiry({ productId: product.id, name, email, phone, message })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-brand-page hover:text-brand-navy-dark"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <h3 id="enquiry-modal-title" className="pr-8 text-lg font-bold text-brand-navy-dark">
          {t.treasures.enquiryForm.title[language]} {product.name?.[language] || product.name?.en}
        </h3>

        {status === 'success' ? (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            {t.treasures.enquiryForm.success[language]}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            {status === 'error' && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {t.treasures.enquiryForm.error[language]}
              </p>
            )}
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.treasures.enquiryForm.name[language]}
              className="rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.treasures.enquiryForm.email[language]}
              className="rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.treasures.enquiryForm.phone[language]}
              className="rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.treasures.enquiryForm.message[language]}
              className="rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-60"
            >
              <Send size={15} aria-hidden="true" />
              {status === 'submitting' ? t.treasures.enquiryForm.submitting[language] : t.treasures.enquiryForm.submit[language]}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
