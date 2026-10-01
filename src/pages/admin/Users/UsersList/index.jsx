import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, KeyRound, Eye, EyeOff, Wand2, Clock, ShieldCheck } from 'lucide-react'
import { getUsers, setUserActive, resetUserPassword, deleteUser } from '../../../../api/usersApi'
import { getRoles } from '../../../../api/rolesApi'
import { selectCurrentUser } from '../../../../redux/slices/authSlice'
import { ROUTES } from '../../../../constants/routes'
import { matchesSearch } from '../../../../lib/search'
import { generatePassword, passwordProblems } from '../../../../lib/password'
import { SearchInput, NoResults } from '../../../../components/ListFilters'
import ToggleSwitch from '../../../../components/ToggleSwitch'
import ConfirmDialog from '../../../../components/ConfirmDialog'

const TABS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['inactive', 'Inactive'],
]

const selectClass =
  'rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

function formatLastLogin(value) {
  if (!value) return 'Never signed in'
  return new Date(value).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function UsersList() {
  const me = useSelector(selectCurrentUser)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const [togglingId, setTogglingId] = useState(null)
  const [pendingDeactivate, setPendingDeactivate] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([getUsers(), getRoles()])
      .then(([usersData, rolesData]) => {
        if (!isMounted) return
        setUsers(usersData)
        setRoles(rolesData)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load users.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const counts = useMemo(() => {
    const active = users.filter((u) => u.isActive).length
    return { all: users.length, active, inactive: users.length - active }
  }, [users])

  const visible = useMemo(
    () =>
      users.filter(
        (user) =>
          (tab === 'all' || (tab === 'active') === Boolean(user.isActive)) &&
          (roleFilter === 'all' || user.role?.id === roleFilter) &&
          matchesSearch({ name: user.name, email: user.email, role: user.role?.name }, search),
      ),
    [users, tab, roleFilter, search],
  )

  async function changeActive(user, isActive) {
    setError('')
    setNotice('')
    setTogglingId(user.id)
    setPendingDeactivate(null)
    const apply = (value) => setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: value } : u)))
    apply(isActive)
    try {
      await setUserActive(user.id, isActive)
    } catch (err) {
      apply(!isActive)
      setError(err.message || 'Failed to update the user.')
    } finally {
      setTogglingId(null)
    }
  }

  function handleToggle(user) {
    if (user.isActive) setPendingDeactivate(user)
    else changeActive(user, true)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(pendingDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Failed to delete the user.')
      setPendingDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  function openReset(user) {
    setResetTarget(user)
    setResetPassword('')
    setShowReset(false)
  }

  async function handleReset() {
    if (!resetTarget) return
    setIsResetting(true)
    setError('')
    try {
      await resetUserPassword(resetTarget.id, resetPassword)
      setUsers((prev) => prev.map((u) => (u.id === resetTarget.id ? { ...u, mustChangePassword: true } : u)))
      setNotice(`Password reset for ${resetTarget.name}. Give them the new password — they must change it at next sign-in.`)
      setResetTarget(null)
    } catch (err) {
      setError(err.message || 'Failed to reset the password.')
      setResetTarget(null)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Users</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            People who can sign in to this admin. Each user has one role, which decides the pages they can open.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_USERS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Create User
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading users…</p>}

      {!isLoading && users.length > 0 && (
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={tab === key}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  tab === key ? 'bg-brand-navy-dark text-white' : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
                }`}
              >
                {label} ({counts[key]})
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, role…" />
          <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
            Role
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
              <option value="all">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {!isLoading && users.length > 0 && visible.length === 0 && <NoResults query={search} />}

      <ul className="mt-5 flex flex-col gap-3">
        {visible.map((user) => {
          const isMe = user.id === me?.id
          return (
            <li
              key={user.id}
              className={`rounded-xl border border-brand-divider p-4 transition-colors duration-300 ${
                user.isActive ? 'bg-white' : 'bg-brand-page/60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                    {user.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-brand-dark">{user.name}</h2>
                      {isMe && (
                        <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-primary">You</span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          user.role?.isSuperAdmin ? 'bg-brand-navy text-white' : 'bg-brand-page text-brand-navy-dark'
                        }`}
                      >
                        {user.role?.isSuperAdmin && <ShieldCheck size={11} aria-hidden="true" />}
                        {user.role?.name || 'No role'}
                      </span>
                      {user.mustChangePassword && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Must change password
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-600">{user.email}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} aria-hidden="true" />
                      {formatLastLogin(user.lastLoginAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500">{user.isActive ? 'Active' : 'Inactive'}</span>
                  <ToggleSwitch
                    checked={Boolean(user.isActive)}
                    label={`${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}`}
                    busy={togglingId === user.id}
                    disabled={isMe}
                    onChange={() => handleToggle(user)}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-1 border-t border-brand-divider pt-3">
                <button
                  type="button"
                  onClick={() => openReset(user)}
                  className="mr-1 inline-flex items-center gap-1.5 rounded-lg border border-brand-divider px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-page"
                >
                  <KeyRound size={14} aria-hidden="true" />
                  Reset password
                </button>
                <Link
                  to={`${ROUTES.ADMIN_USERS}/${user.id}/edit`}
                  aria-label={`Edit ${user.name}`}
                  className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(user)}
                  disabled={isMe}
                  title={isMe ? 'You cannot delete your own account' : undefined}
                  aria-label={`Delete ${user.name}`}
                  className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(pendingDeactivate)}
        title="Deactivate this user?"
        message={
          pendingDeactivate
            ? `${pendingDeactivate.name} will be signed out immediately and will not be able to sign in until you activate them again. Their activity history is kept.`
            : ''
        }
        confirmLabel="Deactivate"
        onConfirm={() => changeActive(pendingDeactivate, false)}
        onCancel={() => setPendingDeactivate(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this user?"
        message={
          pendingDelete
            ? `${pendingDelete.name} (${pendingDelete.email}) will be permanently deleted. Their entries in the audit log are kept. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete user"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(resetTarget)}
        tone="primary"
        title="Reset password"
        message={
          resetTarget
            ? `Set a temporary password for ${resetTarget.name}. They will be signed out and asked to choose their own at next sign-in.`
            : ''
        }
        confirmLabel="Reset password"
        isBusy={isResetting}
        confirmDisabled={passwordProblems(resetPassword).length > 0}
        onConfirm={handleReset}
        onCancel={() => !isResetting && setResetTarget(null)}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex-1">
            <input
              type={showReset ? 'text' : 'password'}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="New temporary password"
              autoComplete="new-password"
              aria-label="New temporary password"
              className="w-full rounded-lg border border-brand-divider px-3 py-2.5 pr-10 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
            <button
              type="button"
              onClick={() => setShowReset((prev) => !prev)}
              aria-label={showReset ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-brand-page"
            >
              {showReset ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
          <button
            type="button"
            onClick={() => {
              setResetPassword(generatePassword())
              setShowReset(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-divider px-3 py-2.5 text-sm font-medium text-brand-navy hover:bg-brand-page"
          >
            <Wand2 size={14} aria-hidden="true" />
            Generate
          </button>
        </div>
        {resetPassword && passwordProblems(resetPassword).length > 0 && (
          <p className="mt-2 text-xs text-gray-500">Needs: {passwordProblems(resetPassword).join(', ').toLowerCase()}.</p>
        )}
      </ConfirmDialog>
    </div>
  )
}
