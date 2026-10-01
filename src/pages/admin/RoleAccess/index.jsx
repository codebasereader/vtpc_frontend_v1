import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users, CheckCircle2, ShieldCheck, KeyRound, Plus, Check } from 'lucide-react'
import { getRoles, setRolePermissions } from '../../../api/rolesApi'
import { PERMISSION_GROUPS } from '../../../constants/adminSections'
import { ROUTES } from '../../../constants/routes'
import { matchesSearch } from '../../../lib/search'
import { SearchInput } from '../../../components/ListFilters'
import ToggleSwitch from '../../../components/ToggleSwitch'
import ConfirmDialog from '../../../components/ConfirmDialog'

const ALL_KEYS = PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.key))
const TITLES = Object.fromEntries(PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => [item.key, item.title])))

const sameSet = (a, b) => a.length === b.length && a.every((key) => b.includes(key))

export default function RoleAccess() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Unsaved edits, per role: { [roleId]: ['leaders', …] }
  const [drafts, setDrafts] = useState({})
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [pendingSwitch, setPendingSwitch] = useState(null)
  const [pendingSave, setPendingSave] = useState(false)

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

  const requestedId = searchParams.get('role')
  const selected =
    roles.find((role) => role.id === requestedId) || roles.find((role) => !role.isSystem) || roles[0] || null

  const saved = useMemo(() => (selected?.permissions || []).filter((key) => ALL_KEYS.includes(key)), [selected])
  const current = selected?.isSystem ? ALL_KEYS : drafts[selected?.id] ?? saved
  const isDirty = Boolean(selected && !selected.isSystem && drafts[selected.id] && !sameSet(drafts[selected.id], saved))
  const added = current.filter((key) => !saved.includes(key))
  const removed = saved.filter((key) => !current.includes(key))
  const readOnly = Boolean(selected?.isSystem)

  function setCurrent(next) {
    if (!selected || readOnly) return
    setNotice('')
    setDrafts((prev) => ({ ...prev, [selected.id]: next }))
  }

  function toggleKey(key) {
    setCurrent(current.includes(key) ? current.filter((k) => k !== key) : [...current, key])
  }

  function toggleGroup(group, enable) {
    const keys = group.items.map((item) => item.key)
    setCurrent(enable ? [...new Set([...current, ...keys])] : current.filter((k) => !keys.includes(k)))
  }

  function selectRole(id) {
    if (id === selected?.id) return
    if (isDirty) setPendingSwitch(id)
    else setSearchParams({ role: id })
  }

  function discardAndSwitch() {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[selected.id]
      return next
    })
    if (pendingSwitch) setSearchParams({ role: pendingSwitch })
    setPendingSwitch(null)
  }

  function discard() {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[selected.id]
      return next
    })
  }

  function requestSave() {
    // Taking pages away from a role that has users affects real people — confirm first.
    if (removed.length > 0 && selected.userCount > 0) setPendingSave(true)
    else save()
  }

  async function save() {
    setPendingSave(false)
    setIsSaving(true)
    setError('')
    try {
      const updated = await setRolePermissions(selected.id, current)
      const permissions = updated?.permissions ?? current
      setRoles((prev) => prev.map((role) => (role.id === selected.id ? { ...role, ...updated, permissions } : role)))
      discard()
      setNotice(`Access for “${selected.name}” updated. It applies immediately — nobody needs to sign in again.`)
    } catch (err) {
      setError(err.message || 'Failed to save the changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const q = search.trim()
  const filteredGroups = PERMISSION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !q || matchesSearch({ title: item.title, group: group.label }, q)),
  })).filter((group) => group.items.length > 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Role Access</h1>
      <p className="mt-1 max-w-2xl text-sm text-gray-600">
        Choose a role, then switch on the pages it can open. Anything switched off is hidden from the menu and blocked
        on the server.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 size={16} aria-hidden="true" />
          {notice}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading roles…</p>}

      {!isLoading && roles.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No roles yet.{' '}
          <Link to={`${ROUTES.ADMIN_ROLES}/new`} className="font-semibold text-brand-primary hover:underline">
            Create the first role
          </Link>
          .
        </p>
      )}

      {!isLoading && selected && (
        <div className="mt-6">
          {/* Role picker — one card per role, four to a row on wide screens */}
          <nav aria-label="Roles" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => {
              const isSelected = role.id === selected.id
              const saved = role.isSystem ? ALL_KEYS.length : role.permissions?.filter((k) => ALL_KEYS.includes(k)).length ?? 0
              // The open role reflects unsaved toggles live.
              const count = isSelected && !role.isSystem ? current.length : saved
              const percent = Math.round((count / ALL_KEYS.length) * 100)
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role.id)}
                  aria-current={isSelected}
                  className={`group relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-primary bg-white shadow-[0_10px_28px_rgba(200,55,68,0.14)] ring-2 ring-brand-primary/20'
                      : 'border-brand-divider bg-white hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-[0_10px_24px_rgba(15,40,80,0.08)]'
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        role.isSystem
                          ? 'bg-brand-navy text-white'
                          : isSelected
                            ? 'bg-brand-primary text-white'
                            : 'bg-brand-surface text-brand-primary group-hover:bg-brand-primary/15'
                      }`}
                    >
                      {role.isSystem ? <ShieldCheck size={22} aria-hidden="true" /> : <KeyRound size={21} aria-hidden="true" />}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {isSelected && isDirty && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                          Unsaved
                        </span>
                      )}
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-divider text-transparent'
                        }`}
                        aria-hidden="true"
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>
                    </span>
                  </span>

                  <span className="mt-3 block truncate text-base font-bold text-brand-dark">{role.name}</span>
                  <span className="mt-0.5 line-clamp-2 min-h-9 text-xs leading-snug text-gray-500">
                    {role.description || (role.isSystem ? 'Full access to every page.' : 'No description')}
                  </span>

                  <span className="mt-4 block">
                    <span className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                      <span className={role.isSystem ? 'text-brand-navy' : 'text-gray-600'}>
                        {role.isSystem ? 'Full access' : `${count} of ${ALL_KEYS.length} pages`}
                      </span>
                      {!role.isSystem && <span className="text-gray-400">{percent}%</span>}
                    </span>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-brand-page">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${role.isSystem ? 'bg-brand-navy' : 'bg-brand-primary'}`}
                        style={{ width: `${role.isSystem ? 100 : percent}%` }}
                      />
                    </span>
                  </span>

                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Users size={13} aria-hidden="true" />
                    {role.userCount ?? 0} user{role.userCount === 1 ? '' : 's'}
                  </span>
                </button>
              )
            })}

            <Link
              to={`${ROUTES.ADMIN_ROLES}/new`}
              className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-divider p-4 text-center text-sm font-semibold text-brand-primary transition-all hover:-translate-y-0.5 hover:border-brand-primary/50 hover:bg-brand-surface/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface">
                <Plus size={20} aria-hidden="true" />
              </span>
              Create a new role
            </Link>
          </nav>

          {/* Matrix */}
          <section aria-label={`Pages for ${selected.name}`} className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-divider bg-white p-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
                  {selected.name}
                  {readOnly && <ShieldCheck size={18} className="text-brand-navy" aria-hidden="true" />}
                </h2>
                <p className="text-sm text-gray-600">
                  {readOnly
                    ? 'Super Admin always has full access, including pages added later. This cannot be changed.'
                    : `${current.length} of ${ALL_KEYS.length} pages enabled${selected.userCount ? ` · ${selected.userCount} user${selected.userCount === 1 ? '' : 's'}` : ' · no users yet'}`}
                </p>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrent([...ALL_KEYS])}
                    className="rounded-lg border border-brand-divider px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-page"
                  >
                    Enable all
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrent([])}
                    className="rounded-lg border border-brand-divider px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-page"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <SearchInput value={search} onChange={setSearch} placeholder="Search pages…" />
            </div>

            {filteredGroups.length === 0 && <p className="mt-6 text-center text-gray-600">No pages match “{search}”.</p>}

            <div className="mt-4 flex flex-col gap-4">
              {filteredGroups.map((group) => {
                const groupKeys = group.items.map((item) => item.key)
                const enabledCount = groupKeys.filter((key) => current.includes(key)).length
                const allOn = enabledCount === groupKeys.length
                return (
                  <div key={group.id} className="overflow-hidden rounded-xl border border-brand-divider bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-brand-divider bg-brand-page px-4 py-3">
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.12em] text-gray-600 uppercase">{group.label}</h3>
                        <p className="text-xs text-gray-500">
                          {enabledCount} of {groupKeys.length} enabled
                        </p>
                      </div>
                      {!readOnly && (
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                          {allOn ? 'Disable all' : 'Enable all'}
                          <ToggleSwitch
                            checked={allOn}
                            label={`${allOn ? 'Disable' : 'Enable'} every page in ${group.label}`}
                            onChange={() => toggleGroup(group, !allOn)}
                          />
                        </label>
                      )}
                    </div>
                    <ul className="divide-y divide-brand-divider">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const on = current.includes(item.key)
                        return (
                          <li key={item.key} className="flex items-center justify-between gap-3 px-4 py-3">
                            <span className="flex min-w-0 items-center gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                                  on ? 'bg-brand-surface text-brand-primary' : 'bg-brand-page text-gray-400'
                                }`}
                              >
                                <Icon size={17} aria-hidden="true" />
                              </span>
                              <span className={`truncate text-sm font-semibold transition-colors ${on ? 'text-brand-dark' : 'text-gray-500'}`}>
                                {item.title}
                              </span>
                            </span>
                            <span className="flex items-center gap-3">
                              <span className="hidden text-xs font-semibold text-gray-500 sm:inline">{on ? 'Allowed' : 'No access'}</span>
                              <ToggleSwitch
                                checked={on}
                                disabled={readOnly}
                                label={`${item.title} for ${selected.name}`}
                                onChange={() => toggleKey(item.key)}
                              />
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* Unsaved-changes bar */}
      {isDirty && (
        <div className="sticky -bottom-4 z-30 -mx-4 mt-6 border-t border-brand-divider bg-white/95 px-4 pt-3 pb-7 shadow-[0_-8px_24px_rgba(15,40,80,0.1)] backdrop-blur md:-bottom-8 md:-mx-8 md:px-8 md:pb-11">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-brand-dark">
              <span className="font-semibold">Unsaved changes for “{selected.name}”:</span>{' '}
              {added.length > 0 && <span className="text-green-700">+{added.length} enabled</span>}
              {added.length > 0 && removed.length > 0 && ' · '}
              {removed.length > 0 && <span className="text-red-700">−{removed.length} removed</span>}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={discard}
                disabled={isSaving}
                className="rounded-lg border border-brand-divider px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={requestSave}
                disabled={isSaving}
                className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-70"
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingSave}
        title="Remove access?"
        message={
          selected
            ? `${selected.userCount} user${selected.userCount === 1 ? '' : 's'} with the “${selected.name}” role will immediately lose access to: ${removed
                .map((key) => TITLES[key])
                .join(', ')}.`
            : ''
        }
        confirmLabel="Save changes"
        isBusy={isSaving}
        onConfirm={save}
        onCancel={() => !isSaving && setPendingSave(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingSwitch)}
        tone="primary"
        title="Discard unsaved changes?"
        message="You have unsaved access changes for this role. Switching to another role will discard them."
        confirmLabel="Discard and switch"
        onConfirm={discardAndSwitch}
        onCancel={() => setPendingSwitch(null)}
      />
    </div>
  )
}
