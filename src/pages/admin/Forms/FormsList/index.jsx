import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Inbox, Link2, ExternalLink, Check, ListChecks, ClipboardList } from 'lucide-react'
import { getAdminForms, setFormActive, deleteForm } from '../../../../api/formsApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import { matchesSearch } from '../../../../lib/search'
import { SearchInput, NoResults } from '../../../../components/ListFilters'
import ToggleSwitch from '../../../../components/ToggleSwitch'
import ConfirmDialog from '../../../../components/ConfirmDialog'

const TABS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['inactive', 'Inactive'],
]

const publicUrl = (slug) => `${window.location.origin}/forms/${slug}`

export default function FormsList() {
  const [forms, setForms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [togglingId, setTogglingId] = useState(null)
  const [pendingDeactivate, setPendingDeactivate] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    let isMounted = true
    getAdminForms()
      .then((data) => {
        if (isMounted) setForms(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load forms.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const counts = useMemo(() => {
    const active = forms.filter((f) => f.isActive).length
    return { all: forms.length, active, inactive: forms.length - active }
  }, [forms])

  const visible = useMemo(
    () =>
      forms.filter(
        (form) =>
          (tab === 'all' || (tab === 'active') === Boolean(form.isActive)) &&
          matchesSearch({ title: form.title, slug: form.slug }, search),
      ),
    [forms, tab, search],
  )

  // Optimistic: flips immediately, rolls back if the server refuses.
  async function changeActive(form, isActive) {
    setError('')
    setTogglingId(form.id)
    setPendingDeactivate(null)
    const apply = (value) => setForms((prev) => prev.map((f) => (f.id === form.id ? { ...f, isActive: value } : f)))
    apply(isActive)
    try {
      await setFormActive(form.id, isActive)
    } catch (err) {
      apply(!isActive)
      setError(err.message || 'Failed to update the form.')
    } finally {
      setTogglingId(null)
    }
  }

  function handleToggle(form) {
    // Turning a form off hides it from the marquee and closes its public link — confirm first.
    if (form.isActive) setPendingDeactivate(form)
    else changeActive(form, true)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteForm(pendingDelete.id)
      setForms((prev) => prev.filter((f) => f.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Failed to delete the form.')
      setPendingDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function copyLink(form) {
    try {
      await navigator.clipboard.writeText(publicUrl(form.slug))
      setCopiedId(form.id)
      setTimeout(() => setCopiedId((current) => (current === form.id ? null : current)), 1800)
    } catch {
      setError('Could not copy the link. You can copy it from the address bar of the public form.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Forms</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Feedback and registration forms. Each active form appears in the scrolling bar under the menu on the home
            page with a “Click here to Register” link to its own page.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_FORMS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Create Form
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading forms…</p>}

      {!isLoading && forms.length === 0 && !error && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand-divider p-10 text-center text-gray-600">
          <ClipboardList size={28} className="text-gray-400" aria-hidden="true" />
          <p className="font-medium text-brand-dark">No forms yet</p>
          <p className="text-sm">Create your first form to start collecting registrations or feedback.</p>
        </div>
      )}

      {!isLoading && forms.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-4">
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
            <SearchInput value={search} onChange={setSearch} placeholder="Search forms…" />
          </div>

          {visible.length === 0 && <NoResults query={search} />}

          <ul className="mt-5 flex flex-col gap-3">
            {visible.map((form) => (
              <li
                key={form.id}
                className={`rounded-xl border bg-white p-4 transition-colors duration-300 ${
                  form.isActive ? 'border-brand-divider' : 'border-brand-divider bg-brand-page/50'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-brand-dark">{getBilingualText(form.title, 'en')}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-300 ${
                          form.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {getBilingualText(form.title, 'kn') && (
                      <p className="mt-0.5 text-sm text-gray-500">{getBilingualText(form.title, 'kn')}</p>
                    )}
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <ListChecks size={13} aria-hidden="true" />
                        {form.questionCount ?? 0} question{form.questionCount === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Inbox size={13} aria-hidden="true" />
                        {form.responseCount ?? 0} response{form.responseCount === 1 ? '' : 's'}
                      </span>
                      <span className="font-mono">/forms/{form.slug}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">{form.isActive ? 'Active' : 'Inactive'}</span>
                    <ToggleSwitch
                      checked={Boolean(form.isActive)}
                      label={`${form.isActive ? 'Deactivate' : 'Activate'} ${getBilingualText(form.title, 'en')}`}
                      busy={togglingId === form.id}
                      onChange={() => handleToggle(form)}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand-divider pt-3">
                  <Link
                    to={`${ROUTES.ADMIN_FORMS}/${form.id}/responses`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
                  >
                    <Inbox size={15} aria-hidden="true" />
                    View responses ({form.responseCount ?? 0})
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyLink(form)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-page hover:text-brand-navy"
                    >
                      {copiedId === form.id ? (
                        <Check size={15} className="text-green-600" aria-hidden="true" />
                      ) : (
                        <Link2 size={15} aria-hidden="true" />
                      )}
                      {copiedId === form.id ? 'Copied' : 'Copy link'}
                    </button>
                    {form.isActive && (
                      <a
                        href={`/forms/${form.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open the public form in a new tab"
                        className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <Link
                      to={`${ROUTES.ADMIN_FORMS}/${form.id}/edit`}
                      aria-label={`Edit ${getBilingualText(form.title, 'en')}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(form)}
                      aria-label={`Delete ${getBilingualText(form.title, 'en')}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeactivate)}
        title="Deactivate this form?"
        message={
          pendingDeactivate
            ? `“${getBilingualText(pendingDeactivate.title, 'en')}” will disappear from the home-page scrolling bar and its public link will stop accepting responses. Existing responses are kept and you can activate it again at any time.`
            : ''
        }
        confirmLabel="Deactivate"
        onConfirm={() => changeActive(pendingDeactivate, false)}
        onCancel={() => setPendingDeactivate(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this form?"
        message={
          pendingDelete
            ? `“${getBilingualText(pendingDelete.title, 'en')}” and all ${pendingDelete.responseCount ?? 0} of its responses will be permanently deleted. Export the responses first if you need them. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete form"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />
    </div>
  )
}
