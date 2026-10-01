import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronRight } from 'lucide-react'
import { selectCurrentUser } from '../../../redux/slices/authSlice'
import { ADMIN_NAV_GROUPS } from '../../../constants/adminSections'
import { roleLabel, visibleGroups } from '../../../lib/access'

export default function Dashboard() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">
        {currentUser ? `Welcome, ${currentUser.name}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-gray-600">
        {roleLabel(currentUser) ? `Signed in as ${roleLabel(currentUser)}. ` : ''}Choose a section to manage.
      </p>

      <div className="mt-8 space-y-8">
        {visibleGroups(ADMIN_NAV_GROUPS, currentUser).map((group) => (
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
