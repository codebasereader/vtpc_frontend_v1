const selectClass =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export function TabIntro({ title, hint }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-brand-navy-dark md:text-xl">{title}</h3>
      {hint && <p className="mt-1 text-sm text-gray-600">{hint}</p>}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ShowAllToggle({ isExpanded, total, limit, onToggle, showAllLabel, showTopLabel }) {
  if (total <= limit) return null
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-5 rounded-full border border-brand-divider px-4 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-page"
    >
      {isExpanded ? showTopLabel : showAllLabel}
    </button>
  )
}

export function EmptyNote({ children }) {
  return <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-500">{children}</p>
}
