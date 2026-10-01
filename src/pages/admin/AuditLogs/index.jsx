import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  LogIn,
  LogOut,
  MonitorSmartphone,
  ShieldAlert,
} from 'lucide-react'
import { auditLogsExportUrl, getAuditLogs, getAuditSession, getAuditSessions } from '../../../api/auditApi'
import { getRoles } from '../../../api/rolesApi'
import { getUsers } from '../../../api/usersApi'
import { ADMIN_SECTIONS } from '../../../constants/adminSections'
import { SearchInput, DateRangeFilter } from '../../../components/ListFilters'
import SideDrawer from '../../../components/SideDrawer'
import { useRemote } from '../../../lib/useRemote'
import { startOfDay, endOfDay } from '../../../lib/search'
import {
  AUDIT_ACTIONS,
  ENDED_BY,
  actionLabel,
  actionTone,
  browserLabel,
  formatChangeValue,
  formatDateTime,
  formatDuration,
  resourceLabel,
} from '../../../lib/audit'

const PAGE_SIZES = [25, 50, 100]
const pad = (n) => String(n).padStart(2, '0')
const toInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const QUICK_RANGES = [
  ['Today', 0],
  ['Last 7 days', 6],
  ['Last 30 days', 29],
]

function rangeFromToday(daysBack) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - daysBack)
  return { from: toInputDate(from), to: toInputDate(to) }
}

const selectClass =
  'rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const EMPTY_FILTERS = { userId: '', roleId: '', action: '', resource: '', q: '', from: '', to: '', activeOnly: false }

const RESOURCE_OPTIONS = ADMIN_SECTIONS.map((section) => ({ key: section.key, title: section.title }))

function ActionBadge({ action }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${actionTone(action)}`}>
      {actionLabel(action)}
    </span>
  )
}

function RoleChip({ name }) {
  if (!name) return null
  return <span className="rounded-full bg-brand-page px-2 py-0.5 text-[11px] font-semibold text-brand-navy-dark">{name}</span>
}

function ChangesTable({ changes }) {
  if (!changes || changes.length === 0) return null
  return (
    <div className="overflow-hidden rounded-xl border border-brand-divider">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-divider bg-brand-page text-[11px] font-bold tracking-wide text-gray-500 uppercase">
            <th className="px-3 py-2">Field</th>
            <th className="px-3 py-2">Before</th>
            <th className="w-6 px-0 py-2" aria-hidden="true" />
            <th className="px-3 py-2">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-divider align-top">
          {changes.map((change, index) => {
            const from = formatChangeValue(change.from)
            const to = formatChangeValue(change.to)
            return (
              <tr key={`${change.field}-${index}`}>
                <td className="px-3 py-2 text-xs font-semibold break-words text-brand-navy-dark">{change.field}</td>
                <td className="max-w-40 px-3 py-2 text-xs text-gray-600">
                  {from ? <pre className="max-h-40 overflow-auto font-sans break-words whitespace-pre-wrap">{from}</pre> : <span className="text-gray-300 italic">empty</span>}
                </td>
                <td className="px-0 py-2 text-gray-300">
                  <ArrowRight size={14} aria-hidden="true" />
                </td>
                <td className="max-w-40 px-3 py-2 text-xs text-brand-dark">
                  {to ? <pre className="max-h-40 overflow-auto font-sans break-words whitespace-pre-wrap">{to}</pre> : <span className="text-gray-300 italic">empty</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Meta({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-brand-dark">{children || '—'}</dd>
    </div>
  )
}

const ACTIVE_WINDOW_MS = 30 * 60 * 1000

function SessionStatus({ session, now }) {
  if (!session.logoutAt) {
    const lastSeen = session.lastActivityAt ? new Date(session.lastActivityAt) : null
    // Closing the tab doesn't end a session until it expires, so "idle" is more honest than "Active now".
    const isIdle = lastSeen && now - lastSeen.getTime() > ACTIVE_WINDOW_MS
    if (isIdle) {
      return (
        <span className="text-xs text-gray-600">
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            Idle · no sign-out yet
          </span>
          <span className="mt-1 block text-[11px] text-gray-400">Last active {formatDateTime(lastSeen)}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" aria-hidden="true" />
        Active now
      </span>
    )
  }
  return (
    <span className="text-xs text-gray-600">
      {formatDateTime(session.logoutAt)}
      <span className="block text-[11px] text-gray-400">{ENDED_BY[session.endedBy] || 'Ended'}</span>
    </span>
  )
}

export default function AuditLogs() {
  const [tab, setTab] = useState('activity')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [logDrawer, setLogDrawer] = useState(null)
  const [sessionDrawerId, setSessionDrawerId] = useState(null)
  // Captured once per visit so render stays pure (decides "active now" vs "idle").
  const [now] = useState(() => Date.now())

  // Search is debounced so we don't query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.q === searchInput.trim() ? prev : { ...prev, q: searchInput.trim() }))
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const options = useRemote('options', () => Promise.all([getUsers(), getRoles()]))
  const [users, roles] = options.data || [[], []]

  const params = useMemo(
    () => ({
      userId: filters.userId,
      roleId: filters.roleId,
      from: filters.from ? startOfDay(filters.from).toISOString() : '',
      to: filters.to ? endOfDay(filters.to).toISOString() : '',
      ...(tab === 'activity'
        ? { action: filters.action, resource: filters.resource, q: filters.q }
        : { active: filters.activeOnly ? 'true' : '' }),
    }),
    [filters, tab],
  )
  const query = { ...params, page, limit: pageSize }
  const listKey = JSON.stringify([tab, query])
  const list = useRemote(listKey, () => (tab === 'activity' ? getAuditLogs(query) : getAuditSessions(query)))

  const items = list.data?.items || []
  const total = list.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = Object.entries(filters).some(([key, value]) => (key === 'activeOnly' ? value : Boolean(value)))

  function setFilter(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setSearchInput('')
    setPage(1)
  }

  function switchTab(next) {
    setTab(next)
    setPage(1)
  }

  const exportUrl = auditLogsExportUrl({ ...params })

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Audit Logs</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            A permanent record of who signed in with which role, everything they changed (with before and after values),
            and when they signed out. Entries can&apos;t be edited or deleted.
          </p>
        </div>
        {tab === 'activity' && (
          <a
            href={exportUrl}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
          >
            <Download size={16} strokeWidth={2} />
            {hasFilters ? 'Export filtered CSV' : 'Export CSV'}
          </a>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Audit views" className="mt-5 inline-flex rounded-xl bg-brand-page p-1">
        {[
          ['activity', 'Activity', Activity],
          ['sessions', 'Sessions', MonitorSmartphone],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => switchTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === key ? 'bg-white text-brand-navy-dark shadow-sm' : 'text-gray-500 hover:text-brand-dark'
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-brand-divider bg-white p-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
            User
            <select value={filters.userId} onChange={(e) => setFilter({ userId: e.target.value })} className={`${selectClass} min-w-44`}>
              <option value="">All users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
            Role
            <select value={filters.roleId} onChange={(e) => setFilter({ roleId: e.target.value })} className={`${selectClass} min-w-40`}>
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          {tab === 'activity' && (
            <>
              <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
                Action
                <select value={filters.action} onChange={(e) => setFilter({ action: e.target.value })} className={`${selectClass} min-w-40`}>
                  <option value="">All actions</option>
                  {Object.entries(AUDIT_ACTIONS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
                Page
                <select value={filters.resource} onChange={(e) => setFilter({ resource: e.target.value })} className={`${selectClass} min-w-40`}>
                  <option value="">All pages</option>
                  {RESOURCE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>
              <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search who, what, record…" className="min-w-52 flex-1" />
            </>
          )}
          {tab === 'sessions' && (
            <label className="flex items-center gap-2 pb-2 text-sm font-medium text-brand-dark">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) => setFilter({ activeOnly: e.target.checked })}
                className="h-4 w-4 accent-[var(--color-brand-primary)]"
              />
              Only people signed in now
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {QUICK_RANGES.map(([label, daysBack]) => {
              const range = rangeFromToday(daysBack)
              const isActive = filters.from === range.from && filters.to === range.to
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFilter(range)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? 'bg-brand-navy-dark text-white' : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
                  }`}
                >
                  {label}
                </button>
              )
            })}
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="px-2 text-sm font-medium text-brand-primary hover:underline">
                Clear all filters
              </button>
            )}
          </div>
          <DateRangeFilter
            from={filters.from}
            to={filters.to}
            onChange={({ from, to }) => setFilter({ from, to })}
            fromLabel="From"
            toLabel="To"
          />
        </div>
      </div>

      {list.error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {list.error}
        </p>
      )}

      <p className="mt-4 text-sm font-semibold text-brand-navy-dark">
        {list.data ? `${total.toLocaleString()} ${tab === 'activity' ? 'entr' + (total === 1 ? 'y' : 'ies') : 'session' + (total === 1 ? '' : 's')}` : 'Loading…'}
      </p>

      {list.data && items.length === 0 && !list.error && (
        <p className="mt-4 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          {hasFilters ? 'Nothing matches these filters.' : 'No activity has been recorded yet.'}
        </p>
      )}

      {items.length > 0 && (
        <div className={`mt-3 overflow-x-auto rounded-2xl border border-brand-divider bg-white transition-opacity ${list.isLoading ? 'opacity-60' : ''}`}>
          {tab === 'activity' ? (
            <table className="w-full min-w-[56rem] text-left">
              <thead>
                <tr className="border-b border-brand-divider bg-brand-page text-xs font-bold tracking-wide text-gray-500 uppercase">
                  <th className="px-4 py-3 whitespace-nowrap">When</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-divider align-top">
                {items.map((log) => (
                  <tr key={log.id} className="cursor-pointer transition-colors hover:bg-brand-page/60" onClick={() => setLogDrawer(log)}>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-600">{formatDateTime(log.at)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-brand-dark">{log.actor?.name || log.actor?.email || log.attemptedEmail || 'Unknown'}</p>
                      {log.actor?.name && <p className="mb-1 text-xs text-gray-500">{log.actor?.email}</p>}
                      <RoleChip name={log.role?.name} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{resourceLabel(log.resource)}</td>
                    <td className="max-w-sm px-4 py-3 text-sm text-gray-700">
                      <span className="line-clamp-2">{log.summary}</span>
                      {log.changes?.length > 0 && (
                        <span className="mt-1 block text-[11px] font-semibold text-brand-primary">
                          {log.changes.length} field{log.changes.length === 1 ? '' : 's'} changed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setLogDrawer(log)
                        }}
                        aria-label="View entry"
                        className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[56rem] text-left">
              <thead>
                <tr className="border-b border-brand-divider bg-brand-page text-xs font-bold tracking-wide text-gray-500 uppercase">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 whitespace-nowrap">Signed in</th>
                  <th className="px-4 py-3 whitespace-nowrap">Signed out</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Changes</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-divider align-top">
                {items.map((session) => (
                  <tr key={session.id} className="cursor-pointer transition-colors hover:bg-brand-page/60" onClick={() => setSessionDrawerId(session.id)}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-brand-dark">{session.actor?.name}</p>
                      <p className="mb-1 text-xs text-gray-500">{session.actor?.email}</p>
                      <RoleChip name={session.role?.name} />
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-600">{formatDateTime(session.loginAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SessionStatus session={session} now={now} />
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-700">
                      {formatDuration(session.loginAt, session.logoutAt || session.lastActivityAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{session.changeCount ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {browserLabel(session.userAgent)}
                      <span className="block text-[11px] text-gray-400">{session.ip}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSessionDrawerId(session.id)
                        }}
                        aria-label="View session"
                        className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Rows
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className={selectClass}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className="rounded-md border border-brand-divider p-2 text-gray-600 hover:bg-brand-page disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-sm font-medium text-brand-dark">
                {page} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= pageCount}
                aria-label="Next page"
                className="rounded-md border border-brand-divider p-2 text-gray-600 hover:bg-brand-page disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogDrawer
        log={logDrawer}
        onClose={() => setLogDrawer(null)}
        onOpenSession={(id) => {
          setLogDrawer(null)
          setSessionDrawerId(id)
        }}
      />
      <SessionDrawer sessionId={sessionDrawerId} now={now} onClose={() => setSessionDrawerId(null)} />
    </div>
  )
}

function LogDrawer({ log, onClose, onOpenSession }) {
  const isSecurity = log && (log.action === 'login_failed' || log.action === 'access_denied')
  return (
    <SideDrawer isOpen={Boolean(log)} title={log ? actionLabel(log.action) : ''} subtitle="Audit entry" onClose={onClose}>
      {log && (
        <div className="flex flex-col gap-5">
          <p className="text-base leading-relaxed text-brand-dark">{log.summary}</p>
          {isSecurity && (
            <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {log.action === 'login_failed' ? 'A sign-in attempt that did not succeed.' : 'A request that was blocked because the role does not include this page.'}
            </p>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Meta label="When">{formatDateTime(log.at)}</Meta>
            <Meta label="Action">
              <ActionBadge action={log.action} />
            </Meta>
            <Meta label="User">{log.actor?.name || '(not signed in)'}</Meta>
            <Meta label="Email">{log.actor?.email || log.attemptedEmail}</Meta>
            <Meta label="Role">{log.role?.name}</Meta>
            <Meta label="Page">{resourceLabel(log.resource)}</Meta>
            <Meta label="Record">{log.target?.label}</Meta>
            <Meta label="Result">{log.status === 'failed' ? 'Failed' : 'Success'}</Meta>
            <Meta label="IP address">{log.ip}</Meta>
            <Meta label="Device">{browserLabel(log.userAgent)}</Meta>
            {log.method && (
              <div className="col-span-2">
                <Meta label="Request">
                  <span className="font-mono text-xs">
                    {log.method} {log.path}
                  </span>
                </Meta>
              </div>
            )}
          </dl>

          {log.changes?.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">What changed</h3>
              <ChangesTable changes={log.changes} />
            </div>
          )}

          {log.sessionId && (
            <button
              type="button"
              onClick={() => onOpenSession(log.sessionId)}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-page"
            >
              <MonitorSmartphone size={16} aria-hidden="true" />
              View everything done in this sign-in
            </button>
          )}
        </div>
      )}
    </SideDrawer>
  )
}

function SessionDrawer({ sessionId, now, onClose }) {
  const detail = useRemote(sessionId || 'none', () => (sessionId ? getAuditSession(sessionId) : Promise.resolve(null)))
  const session = sessionId ? detail.data?.session : null
  const events = detail.data?.events || []

  return (
    <SideDrawer
      isOpen={Boolean(sessionId)}
      title={session ? `${session.actor?.name} · ${formatDateTime(session.loginAt)}` : 'Session'}
      subtitle="Sign-in session"
      onClose={onClose}
      width="max-w-2xl"
    >
      {detail.isLoading && <p className="text-center text-gray-600">Loading session…</p>}
      {detail.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {detail.error}
        </p>
      )}
      {session && !detail.isLoading && (
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Meta label="User">{session.actor?.name}</Meta>
            <Meta label="Role">{session.role?.name}</Meta>
            <Meta label="Signed in">{formatDateTime(session.loginAt)}</Meta>
            <Meta label="Signed out">
              <SessionStatus session={session} now={now} />
            </Meta>
            <Meta label="Duration">{formatDuration(session.loginAt, session.logoutAt || session.lastActivityAt)}</Meta>
            <Meta label="Changes made">{session.changeCount ?? 0}</Meta>
            <Meta label="IP address">{session.ip}</Meta>
            <Meta label="Device">{browserLabel(session.userAgent)}</Meta>
          </dl>

          <div>
            <h3 className="mb-3 text-xs font-bold tracking-wide text-gray-500 uppercase">
              Everything in this session ({events.length})
            </h3>
            {events.length === 0 && <p className="text-sm text-gray-500">No activity recorded.</p>}
            <ol className="relative flex flex-col gap-4 border-l-2 border-brand-divider pl-5">
              {events.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    style={{ left: '-1.85rem' }}
                    className="absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-brand-divider"
                    aria-hidden="true"
                  >
                    {event.action === 'login' ? (
                      <LogIn size={9} className="text-green-600" />
                    ) : event.action === 'logout' || event.action === 'session_expired' ? (
                      <LogOut size={9} className="text-gray-500" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    )}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <ActionBadge action={event.action} />
                    <span className="text-xs text-gray-500">{formatDateTime(event.at)}</span>
                    {event.resource && <span className="text-xs font-semibold text-brand-navy-dark">{resourceLabel(event.resource)}</span>}
                  </div>
                  <p className="mt-1 text-sm text-brand-dark">{event.summary}</p>
                  {event.changes?.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-brand-primary">
                        Show {event.changes.length} change{event.changes.length === 1 ? '' : 's'}
                      </summary>
                      <div className="mt-2">
                        <ChangesTable changes={event.changes} />
                      </div>
                    </details>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </SideDrawer>
  )
}
