import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Lock, KeyRound, Users } from 'lucide-react'
import { getRoles, deleteRole } from '../../../../api/rolesApi'
import { ROUTES } from '../../../../constants/routes'
import ConfirmDialog from '../../../../components/ConfirmDialog'

export default function RolesList() {
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getRoles()
      .then((data) => {
        if (isMounted) setRoles(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load roles.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function handleDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteRole(pendingDelete.id)
      setRoles((prev) => prev.filter((role) => role.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Failed to delete the role.')
      setPendingDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Roles</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            A role decides which admin pages a user can open. Create roles here, then switch pages on or off for each
            role under <Link to={ROUTES.ADMIN_ROLE_ACCESS} className="font-semibold text-brand-primary hover:underline">Role Access</Link>.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_ROLES}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Create Role
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading roles…</p>}

      {!isLoading && roles.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No roles yet.
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {roles.map((role) => (
          <li key={role.id} className="rounded-xl border border-brand-divider bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-brand-dark">{role.name}</h2>
                  {role.isSystem && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-navy px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      <Lock size={11} aria-hidden="true" />
                      Built-in
                    </span>
                  )}
                </div>
                {role.description && <p className="mt-1 text-sm text-gray-600">{role.description}</p>}
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} aria-hidden="true" />
                    {role.userCount ?? 0} user{role.userCount === 1 ? '' : 's'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <KeyRound size={13} aria-hidden="true" />
                    {role.isSystem ? 'Full access to every page' : `${role.permissions?.length ?? 0} page${role.permissions?.length === 1 ? '' : 's'} enabled`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                {!role.isSystem && (
                  <Link
                    to={`${ROUTES.ADMIN_ROLE_ACCESS}?role=${role.id}`}
                    className="mr-1 inline-flex items-center gap-1.5 rounded-lg border border-brand-divider px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-page"
                  >
                    <KeyRound size={14} aria-hidden="true" />
                    Manage access
                  </Link>
                )}
                {!role.isSystem && (
                  <>
                    <Link
                      to={`${ROUTES.ADMIN_ROLES}/${role.id}/edit`}
                      aria-label={`Edit ${role.name}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(role)}
                      disabled={role.userCount > 0}
                      title={role.userCount > 0 ? 'Move its users to another role first' : undefined}
                      aria-label={`Delete ${role.name}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this role?"
        message={pendingDelete ? `“${pendingDelete.name}” will be permanently deleted. This cannot be undone.` : ''}
        confirmLabel="Delete role"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />
    </div>
  )
}
