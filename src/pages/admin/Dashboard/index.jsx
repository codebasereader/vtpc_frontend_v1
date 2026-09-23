import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.key}
            to={section.path}
            className="rounded-[5px] bg-white p-5 shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:bg-brand-surface"
          >
            <h2 className="font-semibold text-brand-primary">{section.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
