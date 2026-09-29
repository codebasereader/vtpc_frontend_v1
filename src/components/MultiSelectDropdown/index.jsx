import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'

export default function MultiSelectDropdown({ options, selected, onChange, placeholder, searchPlaceholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, query])

  function toggleValue(value) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? placeholder)
        : `${selected.length} selected`

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors hover:border-brand-primary/40 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-500' : 'font-medium text-brand-navy-dark'}`}>
          {label}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full min-w-[16rem] rounded-xl border border-brand-divider bg-white shadow-[0_12px_32px_rgba(15,40,80,0.14)]">
          <div className="flex items-center gap-2 border-b border-brand-divider p-2.5">
            <Search size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full text-sm text-brand-dark outline-none"
            />
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary-dark"
              >
                <X size={12} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>

          <ul className="max-h-64 overflow-y-auto py-1" role="listbox" aria-multiselectable="true">
            {filteredOptions.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No matches</li>}
            {filteredOptions.map((opt) => {
              const isSelected = selected.includes(opt.value)
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleValue(opt.value)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-page ${
                      isSelected ? 'bg-brand-surface/60 font-medium text-brand-navy-dark' : 'text-brand-dark'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-divider'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
