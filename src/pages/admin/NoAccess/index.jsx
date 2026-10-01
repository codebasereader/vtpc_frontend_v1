import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { useAccess } from '../../../lib/access'
import { roleLabel } from '../../../lib/access'

export default function NoAccess({ title }) {
  const { user } = useAccess()
  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center rounded-2xl border border-brand-divider bg-white px-6 py-12 text-center shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldAlert size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-brand-dark">You don&apos;t have access to this page</h1>
      <p className="mt-2 text-sm text-gray-600">
        {title ? `“${title}” is not enabled for your role` : 'This page is not enabled for your role'}
        {roleLabel(user) ? ` (${roleLabel(user)})` : ''}. If you need it, ask a Super Admin to turn it on for your role.
      </p>
      <Link
        to={ROUTES.ADMIN_DASHBOARD}
        className="mt-6 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
