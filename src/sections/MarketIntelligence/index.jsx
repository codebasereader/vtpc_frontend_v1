import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Map, Package, Globe2 } from 'lucide-react'
import { getStateExports, getTopProducts, getCountryProducts } from '../../api/marketIntelligenceApi'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { exporterCorner as t } from '../../language/exporterCorner'
import MultiSelectDropdown from '../../components/MultiSelectDropdown'

const PRIMARY = '#c83744'
const NAVY = '#234c86'
const DEFAULT_COUNT = 15
const BAR_COLUMN_WIDTH = 96
const CHART_HEIGHT = 380

const TABS = [
  { key: 'states', icon: Map },
  { key: 'products', icon: Package },
  { key: 'countries', icon: Globe2 },
]

function formatNumber(value) {
  return Math.round(value).toLocaleString('en-IN')
}

function ChartTooltip({ active, payload, label, suffix }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,40,80,0.12)]">
      <p className="font-semibold text-brand-navy-dark">{label}</p>
      <p className="text-gray-600">
        {formatNumber(payload[0].value)}
        {suffix ? ` ${suffix}` : ''}
      </p>
    </div>
  )
}

// Angled category-name ticks so long product/state names stay legible
// instead of overlapping when each bar only gets ~96px of width.
function AngledTick({ x, y, payload }) {
  const label = payload.value.length > 22 ? `${payload.value.slice(0, 22)}…` : payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{payload.value}</title>
      <text
        dx={-8}
        dy={10}
        textAnchor="end"
        transform="rotate(-40)"
        fontSize={12}
        fill="#2d2d2d"
      >
        {label}
      </text>
    </g>
  )
}

// Vertical column chart with names along the X axis and values on the Y
// axis. Each bar gets a fixed minimum width so labels stay readable, and
// the chart scrolls horizontally once there are more bars than fit.
function RankedBarChart({ rows, highlightKey, suffix }) {
  const chartWidth = Math.max(rows.length * BAR_COLUMN_WIDTH, 320)

  return (
    <div className="overflow-x-auto pb-2">
      <div style={{ width: chartWidth }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 72, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7dbdb" />
            <XAxis dataKey="label" interval={0} tick={<AngledTick />} tickLine={false} axisLine={{ stroke: '#e7dbdb' }} />
            <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12, fill: '#6b7280' }} width={64} />
            <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ fill: 'rgba(200,55,68,0.06)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {rows.map((row) => (
                <Cell key={row.key} fill={row.key === highlightKey ? PRIMARY : NAVY} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function YearPills({ years, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onChange(year)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
            year === active
              ? 'bg-brand-primary text-white'
              : 'bg-white text-brand-dark ring-1 ring-brand-divider hover:bg-brand-page'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  )
}

export default function MarketIntelligence() {
  const language = useSelector(selectLanguage)
  const mi = t.marketIntelligence

  const [activeTab, setActiveTab] = useState('states')
  const [states, setStates] = useState([])
  const [products, setProducts] = useState([])
  const [countryProducts, setCountryProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [stateYear, setStateYear] = useState('')
  const [selectedStates, setSelectedStates] = useState([])

  const [productYear, setProductYear] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])

  const [country, setCountry] = useState('')
  const [selectedCountryProducts, setSelectedCountryProducts] = useState([])

  useEffect(() => {
    let isMounted = true
    Promise.all([getStateExports(), getTopProducts(), getCountryProducts()])
      .then(([statesData, productsData, countryData]) => {
        if (!isMounted) return
        setStates(statesData)
        setProducts(productsData)
        setCountryProducts(countryData)

        const years = Object.keys(statesData[0]?.exports || {})
        if (years.length) {
          setStateYear(years[years.length - 1])
          setProductYear(years[years.length - 1])
        }
        const firstCountry = [...new Set(countryData.map((row) => row.country))].sort()[0]
        if (firstCountry) setCountry(firstCountry)
      })
      .catch(() => {
        if (isMounted) {
          setStates([])
          setProducts([])
          setCountryProducts([])
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const stateYears = useMemo(() => Object.keys(states[0]?.exports || {}), [states])
  const productYears = useMemo(() => Object.keys(products[0]?.exports || {}), [products])
  const countries = useMemo(
    () => [...new Set(countryProducts.map((row) => row.country))].sort(),
    [countryProducts],
  )

  const stateOptions = useMemo(
    () => [...states].sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ value: s.slug, label: s.name })),
    [states],
  )
  const productOptions = useMemo(
    () =>
      [...products]
        .sort((a, b) => a.productName.localeCompare(b.productName))
        .map((p) => ({ value: p.hsCode, label: p.productName })),
    [products],
  )
  const countryProductOptionsForCountry = useMemo(() => {
    const names = [...new Set(countryProducts.filter((r) => r.country === country).map((r) => r.productName))]
    return names.sort().map((name) => ({ value: name, label: name }))
  }, [countryProducts, country])

  const stateRows = useMemo(() => {
    if (!stateYear) return []
    const base =
      selectedStates.length > 0 ? states.filter((s) => selectedStates.includes(s.slug)) : [...states]
    const rows = base.map((s) => ({ key: s.slug, label: s.name, value: s.exports[stateYear] || 0 }))
    rows.sort((a, b) => b.value - a.value)
    return selectedStates.length > 0 ? rows : rows.slice(0, DEFAULT_COUNT)
  }, [states, stateYear, selectedStates])

  const productRows = useMemo(() => {
    if (!productYear) return []
    const base =
      selectedProducts.length > 0 ? products.filter((p) => selectedProducts.includes(p.hsCode)) : [...products]
    const rows = base.map((p) => ({ key: p.hsCode, label: p.productName, value: p.exports[productYear] || 0 }))
    rows.sort((a, b) => b.value - a.value)
    return selectedProducts.length > 0 ? rows : rows.slice(0, DEFAULT_COUNT)
  }, [products, productYear, selectedProducts])

  const countryRows = useMemo(() => {
    if (!country) return []
    const base = countryProducts.filter((row) => row.country === country)
    const filtered =
      selectedCountryProducts.length > 0
        ? base.filter((row) => selectedCountryProducts.includes(row.productName))
        : base
    const rows = filtered.map((row) => ({
      key: row.hsCode + row.country,
      label: row.productName,
      value: row.value,
    }))
    rows.sort((a, b) => b.value - a.value)
    return selectedCountryProducts.length > 0 ? rows : rows.slice(0, DEFAULT_COUNT)
  }, [countryProducts, country, selectedCountryProducts])

  function handleCountryChange(nextCountry) {
    setCountry(nextCountry)
    setSelectedCountryProducts([])
  }

  const hasAnyData = states.length > 0 || products.length > 0 || countryProducts.length > 0

  return (
    <section className="bg-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-brand-primary" />
          <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl">{mi.heading[language]}</h2>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">{mi.description[language]}</p>

        {isLoading && <p className="mt-10 text-center text-gray-600">{mi.loading[language]}</p>}

        {!isLoading && !hasAnyData && (
          <p className="mt-10 rounded-2xl border border-dashed border-brand-divider bg-brand-page/60 p-10 text-center text-gray-600">
            {mi.noData[language]}
          </p>
        )}

        {!isLoading && hasAnyData && (
          <div className="mt-8">
            <div className="inline-flex rounded-full bg-brand-page p-1" role="tablist">
              {TABS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === key ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-dark hover:bg-white'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {mi.tabs[key][language]}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-brand-divider bg-white p-5 shadow-[0_8px_24px_rgba(15,40,80,0.06)] sm:p-6">
              {activeTab === 'states' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-brand-navy-dark">{mi.topStates[language]}</p>
                    <YearPills years={stateYears} active={stateYear} onChange={setStateYear} />
                  </div>
                  <div className="mt-4 max-w-sm">
                    <MultiSelectDropdown
                      options={stateOptions}
                      selected={selectedStates}
                      onChange={setSelectedStates}
                      placeholder={mi.allStates[language]}
                      searchPlaceholder={mi.searchStates[language]}
                    />
                  </div>
                  {stateRows.length > 0 ? (
                    <div className="mt-4">
                      <RankedBarChart rows={stateRows} highlightKey="karnataka" suffix={mi.valueCr[language]} />
                    </div>
                  ) : (
                    <p className="mt-6 text-center text-gray-500">{mi.noMatches[language]}</p>
                  )}
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-brand-navy-dark">{mi.topProducts[language]}</p>
                    <YearPills years={productYears} active={productYear} onChange={setProductYear} />
                  </div>
                  <div className="mt-4 max-w-sm">
                    <MultiSelectDropdown
                      options={productOptions}
                      selected={selectedProducts}
                      onChange={setSelectedProducts}
                      placeholder={mi.allProducts[language]}
                      searchPlaceholder={mi.searchProducts[language]}
                    />
                  </div>
                  {productRows.length > 0 ? (
                    <div className="mt-4">
                      <RankedBarChart rows={productRows} suffix={mi.valueCr[language]} />
                    </div>
                  ) : (
                    <p className="mt-6 text-center text-gray-500">{mi.noMatches[language]}</p>
                  )}
                </>
              )}

              {activeTab === 'countries' && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                      aria-label={mi.selectCountry[language]}
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <MultiSelectDropdown
                      options={countryProductOptionsForCountry}
                      selected={selectedCountryProducts}
                      onChange={setSelectedCountryProducts}
                      placeholder={mi.allProducts[language]}
                      searchPlaceholder={mi.searchProducts[language]}
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-brand-navy-dark">
                    {mi.countryTopProducts[language]}
                  </p>
                  {countryRows.length > 0 ? (
                    <div className="mt-2">
                      <RankedBarChart rows={countryRows} />
                    </div>
                  ) : (
                    <p className="mt-6 text-center text-gray-500">{mi.noMatches[language]}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">{mi.relativeValueNote[language]}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
