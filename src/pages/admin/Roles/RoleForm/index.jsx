import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createRole, getRoles, updateRole } from '../../../../api/rolesApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function RoleForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getRoles()
      .then((roles) => {
        const role = roles.find((item) => item.id === id)
        if (!isMounted) return
        if (!role) setError('Role not found.')
        else {
          setName(role.name)
          setDescription(role.description || '')
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load the role.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (name.trim().length < 2) {
      setError('Enter a role name (at least 2 characters).')
      return
    }
    setIsSaving(true)
    try {
      if (isEditMode) {
        await updateRole(id, { name: name.trim(), description: description.trim() })
        navigate(ROUTES.ADMIN_ROLES)
      } else {
        const created = await createRole({ name: name.trim(), description: description.trim() })
        // Straight on to choosing which pages the new role can open.
        navigate(`${ROUTES.ADMIN_ROLE_ACCESS}?role=${created.id}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to save the role.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p className="text-center text-gray-600">Loading…</p>

  return (
    <div>
      <Link to={ROUTES.ADMIN_ROLES} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary">
        <ArrowLeft size={16} />
        Back to Roles
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Role' : 'Create Role'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Role name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Content Editor"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description <span className="text-xs font-normal text-gray-400">optional</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            placeholder="What this role is for, e.g. Maintains leaders, districts and focus sectors."
            className={inputClass}
          />
        </label>
        {!isEditMode && (
          <p className="rounded-lg bg-brand-page px-3 py-2.5 text-sm text-gray-600">
            After creating the role you&apos;ll choose which pages it can open.
          </p>
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Role'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_ROLES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
