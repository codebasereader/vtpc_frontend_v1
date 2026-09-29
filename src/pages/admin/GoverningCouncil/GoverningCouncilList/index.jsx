import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { getStaff, deleteStaff } from '../../../../api/staffApi'
import { ROUTES } from '../../../../constants/routes'

export default function GoverningCouncilList() {
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getStaff()
      .then((data) => {
        if (isMounted) setStaff(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load governing council.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const members = useMemo(
    () =>
      staff
        .filter((item) => item.group === 'governing-council')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [staff],
  )

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteStaff(id)
      setStaff(staff.filter((item) => item.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete member.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Governing Council</h1>
          <p className="mt-1 text-sm text-gray-600">
            Shown on the About Us Governing Council table, in Sl.No. (order) sequence.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_GOVERNING_COUNCIL}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Member
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading…</p>}

      {!isLoading && members.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No governing council members yet. Add the first one above.
        </p>
      )}

      {!isLoading && members.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-page text-sm font-semibold text-brand-navy">
                {member.order}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{member.name}</p>
                <p className="truncate text-sm text-gray-600">{member.role}</p>
              </div>

              {pendingDeleteId === member.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm text-gray-600">Delete?</span>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(member.id)}
                    disabled={isDeleting}
                    aria-label={`Confirm delete ${member.name}`}
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
                    to={`${ROUTES.ADMIN_GOVERNING_COUNCIL}/${member.id}/edit`}
                    aria-label={`Edit ${member.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(member.id)}
                    aria-label={`Delete ${member.name}`}
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
