import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { getLeaders, deleteLeader } from '../../../../api/leadersApi'
import { ROUTES } from '../../../../constants/routes'

function initialsFor(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function LeadersList() {
  const [leaders, setLeaders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getLeaders()
      .then((data) => {
        if (isMounted) setLeaders(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load leaders.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteLeader(id)
      setLeaders(leaders.filter((leader) => leader.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete leader.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Leaders</h1>
          <p className="mt-1 text-gray-600">The CM/Dy. CM/Minister carousel shown on the homepage.</p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_LEADERS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Leader
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading leaders…</p>}

      {!isLoading && leaders.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No leaders yet. Add the first one above.
        </p>
      )}

      {!isLoading && leaders.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {leaders.map((leader) => (
            <li
              key={leader.id}
              className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
            >
              {leader.photo ? (
                <img
                  src={leader.photo}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-page text-sm font-semibold text-brand-navy">
                  {initialsFor(leader.name)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{leader.name}</p>
                <p className="truncate text-sm text-gray-600">{leader.designation?.en}</p>
                {leader.designation?.kn && (
                  <p className="truncate text-sm text-gray-400">{leader.designation.kn}</p>
                )}
              </div>

              <span className="shrink-0 text-xs text-gray-400">Order {leader.order}</span>

              {pendingDeleteId === leader.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm text-gray-600">Delete?</span>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(leader.id)}
                    disabled={isDeleting}
                    aria-label={`Confirm delete ${leader.name}`}
                    className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(null)}
                    disabled={isDeleting}
                    aria-label="Cancel delete"
                    className="rounded-md border border-brand-divider p-1.5 text-gray-600 hover:bg-gray-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    to={`${ROUTES.ADMIN_LEADERS}/${leader.id}/edit`}
                    aria-label={`Edit ${leader.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(leader.id)}
                    aria-label={`Delete ${leader.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
