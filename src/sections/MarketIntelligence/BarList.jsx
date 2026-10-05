import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { formatUsd, percentChange } from './format'

const MAX_SHOWN_CHANGE = 999

export function ChangeChip({ previous, current, previousLabel }) {
  const change = percentChange(previous, current)
  if (change === null) return null

  const isFlat = Math.abs(change) < 0.05
  const isUp = change > 0
  const text = Math.abs(change) > MAX_SHOWN_CHANGE ? `>${MAX_SHOWN_CHANGE}%` : `${Math.abs(change).toFixed(1)}%`
  const tone = isFlat ? 'bg-gray-100 text-gray-600' : isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
  const Icon = isUp ? TrendingUp : TrendingDown
  const words = isFlat ? 'unchanged' : `${isUp ? 'up' : 'down'} ${text}`

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}
      title={previousLabel ? `${words} compared with ${previousLabel}` : words}
    >
      {!isFlat && <Icon size={12} aria-hidden="true" />}
      <span aria-hidden="true">{isFlat ? '0%' : text}</span>
      <span className="sr-only">{previousLabel ? `${words} compared with ${previousLabel}` : words}</span>
    </span>
  )
}

/**
 * A ranked list where every row is a name, a number and a bar. Bars are all
 * measured against the biggest row, so longer = more. Plain HTML rather than
 * an axis chart so long names never get squashed or rotated.
 *
 * row: { key, label, value, previous?, sub?, badge?, highlight? }
 * With `onSelect`, every row becomes a button that calls it with the row.
 */
export default function BarList({ rows, previousLabel, onSelect }) {
  const max = Math.max(...rows.map((row) => row.value), 0)

  return (
    <ol className="space-y-4">
      {rows.map((row, index) => {
        const width = max > 0 ? Math.max((row.value / max) * 100, row.value > 0 ? 1.5 : 0) : 0

        const heading = (
          <span className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-6 shrink-0 text-right text-xs font-semibold text-gray-400 tabular-nums">
                {index + 1}
              </span>
              <span className={`min-w-0 text-sm font-semibold sm:text-base ${row.highlight ? 'text-brand-primary' : 'text-brand-navy-dark'}`}>
                {row.label}
              </span>
              {row.badge && (
                <span className="shrink-0 self-center rounded-full bg-brand-gold/25 px-2 py-0.5 text-[11px] font-bold tracking-wide text-amber-800 uppercase">
                  {row.badge}
                </span>
              )}
              {onSelect && <ChevronRight size={14} aria-hidden="true" className="shrink-0 self-center text-gray-400" />}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-dark tabular-nums sm:text-base">{formatUsd(row.value)}</span>
              <ChangeChip previous={row.previous} current={row.value} previousLabel={previousLabel} />
            </span>
          </span>
        )

        return (
          <li key={row.key}>
            {onSelect ? (
              <button
                type="button"
                className="block w-full rounded-lg text-left transition-colors hover:bg-brand-page/60 focus-visible:outline-2 focus-visible:outline-brand-primary"
                onClick={() => onSelect(row)}
              >
                {heading}
              </button>
            ) : (
              heading
            )}

            <div className="mt-1.5 ml-8 h-3 overflow-hidden rounded-full bg-brand-page" aria-hidden="true">
              <div
                className={`h-full rounded-full ${row.highlight ? 'bg-brand-primary' : 'bg-brand-navy'}`}
                style={{ width: `${width}%` }}
              />
            </div>

            {row.sub && <p className="mt-1 ml-8 text-xs text-gray-500">{row.sub}</p>}
          </li>
        )
      })}
    </ol>
  )
}
