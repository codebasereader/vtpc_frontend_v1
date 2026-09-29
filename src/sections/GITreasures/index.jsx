import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronRight, ImageOff, Mail, Send, X } from 'lucide-react'
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

export default function GITreasures({ products, isLoading }) {
  const language = useSelector(selectLanguage)
  const [selectedTabId, setSelectedTabId] = useState(null)
  const [activeProductId, setActiveProductId] = useState(null)
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

  // Default to the first product of the active tab unless the visitor has
  // explicitly picked a different one still in that tab.
  const activeProduct =
    categoryProducts.find((product) => product.id === activeProductId) ?? categoryProducts[0] ?? null

  function handleSelectTab(tabId) {
    setSelectedTabId(tabId)
    setActiveProductId(null)
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

        {/* Smooth-expanding panel: product-name dropdown + detail card.
            Fixed height so a large category (e.g. 16 Handicrafts) scrolls
            internally instead of pushing the page's layout around. */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-brand-page/60">
          {isLoading && <p className="p-8 text-center text-gray-600">{t.treasures.loading[language]}</p>}

          {!isLoading && categoryProducts.length === 0 && (
            <p className="p-8 text-center text-gray-600">{t.treasures.empty[language]}</p>
          )}

          {!isLoading && categoryProducts.length > 0 && (
            <div
              key={activeTabId}
              className="animate-fade-slide-up grid gap-0 lg:h-[600px] lg:grid-cols-[minmax(0,280px)_1fr]"
            >
              {/* Product name dropdown */}
              <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto border-b border-brand-divider p-4 lg:max-h-none lg:border-r lg:border-b-0 lg:p-5">
                {categoryProducts.map((product) => {
                  const isActive = product.id === activeProduct?.id
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setActiveProductId(product.id)}
                      className={`group flex shrink-0 items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-brand-primary shadow-[0_4px_14px_rgba(15,40,80,0.08)]'
                          : 'text-brand-dark hover:bg-white/70'
                      }`}
                    >
                      {product.name?.[language] || product.name?.en}
                      <ChevronRight
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${
                          isActive ? 'translate-x-0.5 text-brand-primary' : 'text-gray-400'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>

              {/* Selected product detail — big image pane + scrollable copy */}
              <div className="min-h-0">
                {activeProduct ? (
                  <div key={activeProduct.id} className="animate-fade-slide-up flex h-full flex-col lg:flex-row">
                    {activeProduct.image ? (
                      <img
                        src={activeProduct.image}
                        alt={activeProduct.name?.en}
                        className="h-72 w-full shrink-0 object-cover md:h-96 lg:h-full lg:w-[45%]"
                      />
                    ) : (
                      <span className="flex h-72 w-full shrink-0 items-center justify-center bg-brand-surface text-gray-400 md:h-96 lg:h-full lg:w-[45%]">
                        <ImageOff size={32} aria-hidden="true" />
                      </span>
                    )}
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-5 md:p-7">
                      <span className="w-fit rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-primary">
                        {activeProduct.category}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-brand-navy-dark md:text-2xl">
                        {activeProduct.name?.[language] || activeProduct.name?.en}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 md:text-base">
                        {activeProduct.summary?.[language] || activeProduct.summary?.en}
                      </p>
                      <button
                        type="button"
                        onClick={() => setEnquiryProduct(activeProduct)}
                        className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-primary-dark hover:shadow-[0_10px_24px_rgba(200,55,68,0.35)]"
                      >
                        <Mail size={15} aria-hidden="true" />
                        {t.treasures.enquireNow[language]}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="p-8 text-center text-gray-500">{t.treasures.selectPrompt[language]}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {enquiryProduct && (
        <EnquiryModal product={enquiryProduct} language={language} onClose={() => setEnquiryProduct(null)} />
      )}
    </section>
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
