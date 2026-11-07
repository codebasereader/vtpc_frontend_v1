import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronRight, Search, X } from 'lucide-react'
import { selectCurrentUser } from '../../../redux/slices/authSlice'
import { ADMIN_NAV_GROUPS } from '../../../constants/adminSections'
import { roleLabel, visibleGroups } from '../../../lib/access'

export default function Dashboard() {
  const currentUser = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const all = visibleGroups(ADMIN_NAV_GROUPS, currentUser)
    if (!needle) return all
    // A match on the group name (e.g. "Events") keeps the whole group; otherwise filter by section title.
    return all
      .map((group) =>
        group.label.toLowerCase().includes(needle)
          ? group
          : { ...group, items: group.items.filter((section) => section.title.toLowerCase().includes(needle)) },
      )
      .filter((group) => group.items.length > 0)
  }, [currentUser, query])

  const firstMatch = groups[0]?.items[0]

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">
        {currentUser ? `Welcome, ${currentUser.name}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-gray-600">
        {roleLabel(currentUser) ? `Signed in as ${roleLabel(currentUser)}. ` : ''}Choose a section to manage.
      </p>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          if (query.trim() && firstMatch) navigate(firstMatch.path)
        }}
        className="relative mt-6 max-w-xl"
      >
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sections (e.g. events, users, downloads)…"
          aria-label="Search admin sections"
          className="w-full rounded-xl border border-brand-divider bg-white py-3 pr-10 pl-10 text-sm text-brand-dark shadow-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-brand-page hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      <div className="mt-8 space-y-8">
        {groups.length === 0 && (
          <p className="text-gray-600">No sections match “{query.trim()}”.</p>
        )}
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
              {group.label}
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((section) => {
                const Icon = section.icon
                return (
                  <Link
                    key={section.key}
                    to={section.path}
                    className="group flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-5 transition-shadow hover:border-brand-primary/30 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-page text-brand-navy transition-colors group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <h3 className="font-semibold text-brand-dark">{section.title}</h3>
                    </span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-gray-300 transition-colors group-hover:text-brand-primary"
                    />
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
