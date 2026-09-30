import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, UserRound } from 'lucide-react'
import { getStaff, deleteStaff } from '../../../../api/staffApi'
import { ROUTES } from '../../../../constants/routes'
import RecordDrawer from '../../../../components/RecordDrawer'

export default function OrgChartList() {
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getStaff()
      .then((data) => {
        if (isMounted) setStaff(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load org chart.')
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
      staff.filter((item) => item.group === 'org-chart').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
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
          <h1 className="text-2xl font-bold text-brand-dark">Org Chart</h1>
          <p className="mt-1 text-sm text-gray-600">
            Shown on the About Us Organization Chart. Order 1–3 form the vertical chain (Chairman → Managing
            Director → Joint Director); order 4 and above render as siblings under the Joint Director.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_ORG_CHART}/new`}
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
          No org chart members yet. Add the first one above.
        </p>
      )}

      {!isLoading && members.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-page text-brand-navy">
                {member.photo ? (
                  <img src={member.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={18} aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">
                  {member.name} <span className="font-normal text-gray-500">— Order {member.order}</span>
                </p>
                <p className="truncate text-sm whitespace-pre-line text-gray-600">{member.role}</p>
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
                  <button
                    type="button"
                    onClick={() => setViewing(member)}
                    aria-label="View details"
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Eye size={16} />
                  </button>
                  <Link
                    to={`${ROUTES.ADMIN_ORG_CHART}/${member.id}/edit`}
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
      <RecordDrawer
        record={viewing}
        title={viewing ? viewing.name : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
