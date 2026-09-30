import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Mail,
  Phone,
  Eye,
  Download,
  ChevronDown,
  CheckCircle2,
  Clock,
  Inbox,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ImageOff,
  Check,
} from 'lucide-react'
import { getBilingualText } from '../../lib/bilingual'
import { matchesSearch, isWithinDates } from '../../lib/search'
import { SearchInput, DateRangeFilter, NoResults } from '../ListFilters'
import RecordDrawer from '../RecordDrawer'

const PAGE_SIZE = 25
const NEW_WINDOW_MS = 48 * 60 * 60 * 1000

const STATUS_TABS = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['contacted', 'Contacted'],
]

const selectClass =
  'rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'export'
  )
}

/**
 * Shared admin screen for visitor enquiries: newest-first list, search,
 * date range, status tabs, "mark as contacted", CSV export and a detail
 * drawer. Used for GI product enquiries (with a product filter) and for the
 * site-wide Contact Us enquiries (without one).
 *
 * Props
 *  - load(): Promise<{ enquiries, products? }>   — `products` turns on the product features
 *  - setContacted(id, contacted): Promise<enquiry>
 *  - title / description / emptyTitle / emptyHint: copy
 *  - filePrefix: CSV file name prefix, e.g. "gi-enquiries"
 */
export default function EnquiriesBoard({
  title,
  description,
  emptyTitle,
  emptyHint,
  filePrefix,
  hasProducts = false,
  load,
  setContacted,
}) {
  const [enquiries, setEnquiries] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [productFilter, setProductFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [newestFirst, setNewestFirst] = useState(true)
  const [limit, setLimit] = useState(PAGE_SIZE)
  // Captured once so render stays pure (used for the "New" badge).
  const [loadedAt] = useState(() => Date.now())

  const [viewing, setViewing] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    load()
      .then((data) => {
        if (!isMounted) return
        setEnquiries(data.enquiries)
        setProducts(data.products || [])
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load enquiries.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [load])

  // Close the export menu on outside click / Escape.
  useEffect(() => {
    if (!isExportOpen) return undefined
    const onPointerDown = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsExportOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isExportOpen])

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const productName = (id) => getBilingualText(productsById.get(id)?.name, 'en') || id

  // Products that have enquiries, most-enquired first, for the filter.
  const productOptions = useMemo(() => {
    if (!hasProducts) return []
    const counts = new Map()
    enquiries.forEach((enquiry) => counts.set(enquiry.productId, (counts.get(enquiry.productId) || 0) + 1))
    return [...counts.entries()]
      .map(([id, count]) => ({ id, count, name: getBilingualText(productsById.get(id)?.name, 'en') || id }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [enquiries, productsById, hasProducts])

  const stats = useMemo(() => {
    const contacted = enquiries.filter((e) => e.contacted).length
    return { all: enquiries.length, contacted, pending: enquiries.length - contacted }
  }, [enquiries])

  const filtered = useMemo(() => {
    const rows = enquiries.filter(
      (enquiry) =>
        (productFilter === 'all' || enquiry.productId === productFilter) &&
        (statusFilter === 'all' || (statusFilter === 'contacted') === Boolean(enquiry.contacted)) &&
        isWithinDates(enquiry.createdAt, dateRange.from, dateRange.to) &&
        (matchesSearch(enquiry, search) ||
          (hasProducts && matchesSearch({ product: getBilingualText(productsById.get(enquiry.productId)?.name, 'en') }, search))),
    )
    rows.sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt)
      return newestFirst ? -diff : diff
    })
    return rows
  }, [enquiries, productFilter, statusFilter, search, dateRange, newestFirst, productsById, hasProducts])

  const isFiltered = Boolean(
    productFilter !== 'all' || statusFilter !== 'all' || search.trim() || dateRange.from || dateRange.to,
  )
  const visible = filtered.slice(0, limit)

  // Any filter change goes back to the first page of results.
  function withReset(setter) {
    return (value) => {
      setter(value)
      setLimit(PAGE_SIZE)
    }
  }

  function clearFilters() {
    setProductFilter('all')
    setStatusFilter('all')
    setSearch('')
    setDateRange({ from: '', to: '' })
    setLimit(PAGE_SIZE)
  }

  // Optimistic: flips immediately, rolls back if the server refuses.
  async function toggleContacted(enquiry) {
    const next = !enquiry.contacted
    setError('')
    setUpdatingId(enquiry.id)
    const apply = (patch) =>
      setEnquiries((prev) => prev.map((item) => (item.id === enquiry.id ? { ...item, ...patch } : item)))
    apply({ contacted: next, contactedAt: next ? new Date().toISOString() : null })
    try {
      const updated = await setContacted(enquiry.id, next)
      apply({ ...updated, contacted: updated?.contacted ?? next })
    } catch (err) {
      apply({ contacted: Boolean(enquiry.contacted), contactedAt: enquiry.contactedAt ?? null })
      setError(err.message || 'Failed to update the enquiry.')
    } finally {
      setUpdatingId(null)
    }
  }

  function exportCsv(rows, label) {
    const header = [
      'Received',
      ...(hasProducts ? ['Product'] : []),
      'Name',
      'Email',
      'Phone',
      'Message',
      'Contacted',
      'Contacted on',
    ]
    const lines = [
      header.join(','),
      ...rows.map((e) =>
        [
          e.createdAt || '',
          ...(hasProducts ? [productName(e.productId)] : []),
          e.name,
          e.email,
          e.phone,
          e.message,
          e.contacted ? 'Yes' : 'No',
          e.contactedAt || '',
        ]
          .map(csvEscape)
          .join(','),
      ),
    ]
    // BOM so Excel reads UTF-8 (Kannada names/messages) correctly.
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filePrefix}-${label}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }

  const exportOptions = [
    { key: 'all', label: 'All enquiries', hint: `${enquiries.length} rows`, rows: enquiries, file: 'all' },
  ]
  if (hasProducts && productFilter !== 'all') {
    const productRows = enquiries.filter((e) => e.productId === productFilter)
    exportOptions.push({
      key: 'product',
      label: `Only ${productName(productFilter)}`,
      hint: `${productRows.length} rows`,
      rows: productRows,
      file: slugify(productName(productFilter)),
    })
  }
  if (isFiltered) {
    exportOptions.push({
      key: 'filtered',
      label: 'Current results (with filters)',
      hint: `${filtered.length} rows`,
      rows: filtered,
      file: 'filtered',
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>

        <div ref={exportRef} className="relative">
          <button
            type="button"
            onClick={() => setIsExportOpen((open) => !open)}
            disabled={enquiries.length === 0}
            aria-haspopup="menu"
            aria-expanded={isExportOpen}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-50"
          >
            <Download size={16} strokeWidth={2} />
            Export CSV
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {isExportOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-brand-divider bg-white py-1 shadow-[0_12px_32px_rgba(15,40,80,0.15)]"
            >
              {exportOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="menuitem"
                  onClick={() => exportCsv(option.rows, option.file)}
                  disabled={option.rows.length === 0}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-brand-dark transition-colors hover:bg-brand-page disabled:opacity-50"
                >
                  <span className="min-w-0 truncate font-medium">{option.label}</span>
                  <span className="shrink-0 text-xs text-gray-500">{option.hint}</span>
                </button>
              ))}
              {exportOptions.length === 1 && (
                <p className="border-t border-brand-divider px-4 py-2 text-xs text-gray-500">
                  {hasProducts ? 'Pick a product or apply filters to export just those.' : 'Apply filters to export just those.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading enquiries…</p>}

      {!isLoading && enquiries.length === 0 && !error && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand-divider p-10 text-center text-gray-600">
          <Inbox size={28} className="text-gray-400" aria-hidden="true" />
          <p className="font-medium text-brand-dark">{emptyTitle}</p>
          <p className="text-sm">{emptyHint}</p>
        </div>
      )}

      {!isLoading && enquiries.length > 0 && (
        <>
          {/* Summary tiles double as status filters */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ['all', 'Total', stats.all, Inbox, 'text-brand-navy'],
              ['pending', 'Pending', stats.pending, Clock, 'text-amber-600'],
              ['contacted', 'Contacted', stats.contacted, CheckCircle2, 'text-green-600'],
            ].map(([key, label, value, Icon, tone]) => (
              <button
                key={key}
                type="button"
                onClick={() => withReset(setStatusFilter)(key)}
                aria-pressed={statusFilter === key}
                className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,40,80,0.08)] ${
                  statusFilter === key ? 'border-brand-primary ring-2 ring-brand-primary/15' : 'border-brand-divider'
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page ${tone}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-2xl leading-none font-extrabold text-brand-dark">{value}</span>
                  <span className="mt-1 block text-xs font-semibold text-gray-500">{label}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-brand-divider bg-white p-4">
            <div className="flex flex-wrap items-end gap-4">
              {hasProducts && (
                <label className="flex min-w-56 flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
                  Product
                  <select
                    value={productFilter}
                    onChange={(e) => withReset(setProductFilter)(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All products ({enquiries.length})</option>
                    {productOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} ({option.count})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <SearchInput
                value={search}
                onChange={withReset(setSearch)}
                placeholder="Search name, email, phone, message…"
                className="min-w-56 flex-1"
              />
              <button
                type="button"
                onClick={() => setNewestFirst((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-brand-divider px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
              >
                {newestFirst ? (
                  <ArrowDownWideNarrow size={16} aria-hidden="true" />
                ) : (
                  <ArrowUpWideNarrow size={16} aria-hidden="true" />
                )}
                {newestFirst ? 'Newest first' : 'Oldest first'}
              </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_TABS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => withReset(setStatusFilter)(key)}
                    aria-pressed={statusFilter === key}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      statusFilter === key
                        ? 'bg-brand-navy-dark text-white'
                        : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
                    }`}
                  >
                    {label} ({stats[key]})
                  </button>
                ))}
              </div>
              <DateRangeFilter
                from={dateRange.from}
                to={dateRange.to}
                onChange={withReset(setDateRange)}
                fromLabel="Received from"
                toLabel="Received to"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-navy-dark">
              {isFiltered ? `${filtered.length} of ${enquiries.length} enquiries` : `${enquiries.length} enquiries`}
            </p>
            {isFiltered && (
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-brand-primary hover:underline">
                Clear all filters
              </button>
            )}
          </div>

          {filtered.length === 0 && <NoResults query={search} />}

          {filtered.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3">
              {visible.map((enquiry) => {
                const product = productsById.get(enquiry.productId)
                const isNew = !enquiry.contacted && loadedAt - new Date(enquiry.createdAt) < NEW_WINDOW_MS
                return (
                  <li
                    key={enquiry.id}
                    className={`rounded-xl border bg-white p-4 transition-colors duration-300 ${
                      enquiry.contacted ? 'border-brand-divider bg-brand-page/40' : 'border-brand-divider'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {hasProducts && (
                          <>
                            {product?.image ? (
                              <img
                                src={product.image}
                                alt=""
                                loading="lazy"
                                className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-brand-divider"
                              />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-page text-gray-400">
                                <ImageOff size={15} aria-hidden="true" />
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => withReset(setProductFilter)(enquiry.productId)}
                              title="Show only this product"
                              className="truncate rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                            >
                              {productName(enquiry.productId)}
                            </button>
                          </>
                        )}
                        {isNew && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <time dateTime={enquiry.createdAt} className="text-xs text-gray-500">
                        {formatDateTime(enquiry.createdAt)}
                      </time>
                    </div>

                    <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,14rem)_1fr]">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-dark">{enquiry.name}</p>
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="mt-1 flex items-center gap-1.5 truncate text-sm text-brand-primary hover:underline"
                        >
                          <Mail size={13} aria-hidden="true" />
                          {enquiry.email}
                        </a>
                        {enquiry.phone && (
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
                          >
                            <Phone size={13} aria-hidden="true" />
                            {enquiry.phone}
                          </a>
                        )}
                      </div>
                      <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                        {enquiry.message}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand-divider pt-3">
                      {enquiry.contacted ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={14} aria-hidden="true" />
                            Contacted{enquiry.contactedAt ? ` · ${formatDate(enquiry.contactedAt)}` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleContacted(enquiry)}
                            disabled={updatingId === enquiry.id}
                            className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-brand-primary hover:underline disabled:opacity-60"
                          >
                            Undo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleContacted(enquiry)}
                          disabled={updatingId === enquiry.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary px-3.5 py-1.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-60"
                        >
                          <Check size={15} aria-hidden="true" />
                          Mark as contacted
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewing(enquiry)}
                        aria-label="View details"
                        className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {filtered.length > visible.length && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
                className="rounded-lg border border-brand-divider px-5 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-page"
              >
                Show more ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      <RecordDrawer
        record={
          viewing && {
            ...(hasProducts ? { product: productName(viewing.productId) } : {}),
            received: viewing.createdAt,
            name: viewing.name,
            email: viewing.email,
            phone: viewing.phone,
            message: viewing.message,
            contacted: Boolean(viewing.contacted),
            contactedAt: viewing.contactedAt,
            contactedBy: viewing.contactedBy,
          }
        }
        title={viewing ? (hasProducts ? `${viewing.name} — ${productName(viewing.productId)}` : viewing.name) : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
