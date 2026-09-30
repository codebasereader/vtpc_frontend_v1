import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Download, Send } from 'lucide-react'
import { getNewsletterSubscribers, getNewsletterSubscribersExportUrl } from '../../../../api/newsletterApi'
import { ROUTES } from '../../../../constants/routes'

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getNewsletterSubscribers()
      .then((data) => {
        if (isMounted) setSubscribers(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load subscribers.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Everyone who signed up via the footer form. Duplicate emails are rejected automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.ADMIN_NEWSLETTER_ISSUES}
            className="flex items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
          >
            <Send size={16} strokeWidth={2} />
            Send Newsletter
          </Link>
          <a
            href={getNewsletterSubscribersExportUrl()}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
          >
            <Download size={16} strokeWidth={2} />
            Export CSV
          </a>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="mt-5 text-sm font-semibold text-brand-navy-dark">
        {isLoading ? 'Loading…' : `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}
      </p>

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading subscribers…</p>}

      {!isLoading && subscribers.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No subscribers yet.
        </p>
      )}

      {!isLoading && subscribers.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-divider bg-brand-page">
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Subscribed on</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {subscribers.map((sub) => (
                <tr key={sub.id || sub.email} className="transition-colors hover:bg-brand-page/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-brand-dark">
                      <Mail size={14} className="text-gray-400" aria-hidden="true" />
                      {sub.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
