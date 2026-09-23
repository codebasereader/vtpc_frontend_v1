import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronRight } from 'lucide-react'
import { selectCurrentUser } from '../../../redux/slices/authSlice'
import { ADMIN_SECTIONS } from '../../../constants/adminSections'

export default function Dashboard() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">
        {currentUser ? `Welcome, ${currentUser.name}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-gray-600">Choose a section to manage.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => {
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
                <h2 className="font-semibold text-brand-dark">{section.title}</h2>
              </span>
              <ChevronRight
                size={18}
                className="shrink-0 text-gray-300 transition-colors group-hover:text-brand-primary"
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
