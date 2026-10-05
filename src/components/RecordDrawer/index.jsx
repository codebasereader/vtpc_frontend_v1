import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useExitTransition } from '../../lib/useExitTransition'
import { safeUrl } from '../../lib/safeUrl'

const HIDDEN_KEYS = new Set(['id', '_id', '__v', 'createdAt', 'updatedAt', 'depth'])
const MEDIA_KEYS = new Set(['image', 'photo', 'video'])
const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i
const PDF_RE = /\.pdf(\?.*)?$/i
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T/

function prettifyKey(key) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function isEmpty(value) {
  if (value == null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.values(value).every(isEmpty)
  return false
}

function isBilingual(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every((key) => key === 'en' || key === 'kn')
}

function Value({ value, formatter, isHtml }) {
  if (isHtml && typeof value === 'string' && value) {
    return (
      <iframe
        title="Preview"
        sandbox=""
        srcDoc={value}
        className="h-96 w-full rounded-lg border border-brand-divider bg-white"
      />
    )
  }
  if (formatter) return <span className="text-sm text-brand-dark">{formatter(value)}</span>
  if (isEmpty(value)) return <span className="text-sm text-gray-400">—</span>
  if (typeof value === 'boolean') return <span className="text-sm text-brand-dark">{value ? 'Yes' : 'No'}</span>
  if (typeof value === 'number') return <span className="text-sm text-brand-dark">{value.toLocaleString()}</span>

  if (typeof value === 'string') {
    if (IMAGE_RE.test(value)) {
      return <img src={safeUrl(value)} alt="" loading="lazy" className="max-h-64 w-full rounded-lg object-contain ring-1 ring-brand-divider" />
    }
    if (VIDEO_RE.test(value)) {
      return <video src={safeUrl(value)} controls preload="metadata" className="max-h-72 w-full rounded-lg bg-black" />
    }
    if (ISO_DATE_RE.test(value) && !Number.isNaN(Date.parse(value))) {
      return <span className="text-sm text-brand-dark">{new Date(value).toLocaleString()}</span>
    }
    if (PDF_RE.test(value)) {
      return (
        <a href={safeUrl(value) || undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary underline">
          Open PDF
        </a>
      )
    }
    if (/^https?:\/\//i.test(value)) {
      return (
        <a href={value} target="_blank" rel="noreferrer" className="text-sm break-all text-brand-primary underline">
          {value}
        </a>
      )
    }
    return <span className="text-sm leading-relaxed whitespace-pre-wrap text-brand-dark">{value}</span>
  }

  if (isBilingual(value)) {
    return (
      <div className="flex flex-col gap-1.5">
        {['en', 'kn'].map((lang) => (
          <p key={lang} className="text-sm leading-relaxed text-brand-dark">
            <span className="mr-2 rounded bg-brand-page px-1.5 py-0.5 text-[10px] font-bold text-gray-500 uppercase">
              {lang === 'en' ? 'EN' : 'KN'}
            </span>
            <span className="whitespace-pre-wrap">{value[lang] || <span className="text-gray-400">—</span>}</span>
          </p>
        ))}
      </div>
    )
  }

  if (Array.isArray(value)) {
    if (value.every((item) => item == null || typeof item !== 'object')) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <span key={index} className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-primary">
              {String(item)}
            </span>
          ))}
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-lg border border-brand-divider bg-brand-page/50 p-3">
            <Fields record={item} />
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') return <Fields record={value} />
  return <span className="text-sm text-brand-dark">{String(value)}</span>
}

function Fields({ record, formatters, htmlFields, fieldLabels }) {
  // Media first so the picture/video leads, then everything else in API order.
  const entries = Object.entries(record)
    .filter(([key]) => !HIDDEN_KEYS.has(key))
    .sort(([a], [b]) => Number(MEDIA_KEYS.has(b)) - Number(MEDIA_KEYS.has(a)))

  return (
    <dl className="flex flex-col gap-4">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="mb-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">{fieldLabels?.[key] ?? prettifyKey(key)}</dt>
          <dd>
            <Value value={value} formatter={formatters?.[key]} isHtml={htmlFields?.includes(key)} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Read-only detail drawer that slides in from the right. Renders every
 * field of `record` generically (bilingual text, images, videos, lists…),
 * so it stays correct when fields are added. `formatters` lets a list turn
 * a raw value (e.g. a district slug) into a readable label.
 */
export default function RecordDrawer({ record, title, formatters, htmlFields, fieldLabels, onClose }) {
  const isOpen = Boolean(record)
  const { mounted, visible } = useExitTransition(isOpen, 300)

  // Keep the last record/title so the panel doesn't blank out while sliding away.
  const [last, setLast] = useState({ record, title })
  if (record && (last.record !== record || last.title !== title)) setLast({ record, title })

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  const shown = last

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={shown.title}
        className={`absolute inset-y-0 right-0 flex h-dvh w-full max-w-xl flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-brand-divider px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">Details</p>
            <h2 className="truncate text-lg font-bold text-brand-dark">{shown.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-gray-600 hover:bg-brand-page"
          >
            <X size={22} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Fields record={shown.record} formatters={formatters} htmlFields={htmlFields} fieldLabels={fieldLabels} />
        </div>
      </aside>
    </div>
  )
}
