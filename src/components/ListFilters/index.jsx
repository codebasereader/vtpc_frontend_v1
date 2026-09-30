import { Search, X, CalendarRange } from 'lucide-react'

const fieldClass =
  'rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${fieldClass} w-full pr-9 pl-9`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-brand-page hover:text-gray-700"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// `from` / `to` are yyyy-mm-dd strings (native date inputs).
export function DateRangeFilter({ from, to, onChange, fromLabel = 'From', toLabel = 'To' }) {
  const hasValue = Boolean(from || to)
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
        <span className="flex items-center gap-1">
          <CalendarRange size={12} aria-hidden="true" />
          {fromLabel}
        </span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
        {toLabel}
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className={fieldClass}
        />
      </label>
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '' })}
          className="rounded-lg px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-surface"
        >
          Clear dates
        </button>
      )}
    </div>
  )
}

export function NoResults({ query }) {
  return (
    <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
      {query ? `No results for “${query}”.` : 'No results match the current filters.'}
    </p>
  )
}
