import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Wand2, Copy, Check, CheckCircle2 } from 'lucide-react'
import { createUser, getUsers, updateUser } from '../../../../api/usersApi'
import { getRoles } from '../../../../api/rolesApi'
import { ROUTES } from '../../../../constants/routes'
import { generatePassword, passwordProblems, PASSWORD_RULES } from '../../../../lib/password'
import Button from '../../../../components/Button'

const inputClass =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [roles, setRoles] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null) // { email, password, name } shown once after creation
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true
    const requests = [getRoles()]
    if (isEditMode) requests.push(getUsers())
    Promise.all(requests)
      .then(([rolesData, usersData]) => {
        if (!isMounted) return
        setRoles(rolesData)
        if (isEditMode) {
          const user = usersData.find((item) => item.id === id)
          if (!user) {
            setError('User not found.')
            return
          }
          setName(user.name)
          setEmail(user.email)
          setRoleId(user.role?.id || '')
        } else {
          // No default: the creator must pick a role deliberately, so nobody gets broad access by accident.
          setRoleId('')
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  const selectedRole = roles.find((role) => role.id === roleId)
  const problems = password ? passwordProblems(password) : []

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!name.trim()) return setError('Enter the user’s name.')
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    if (!roleId) return setError('Choose a role.')
    if (!isEditMode && passwordProblems(password).length > 0) return setError('Choose a password that meets all the rules.')

    setIsSaving(true)
    try {
      if (isEditMode) {
        await updateUser(id, { name: name.trim(), email: email.trim(), roleId })
        navigate(ROUTES.ADMIN_USERS)
      } else {
        await createUser({ name: name.trim(), email: email.trim(), roleId, password })
        setCreated({ name: name.trim(), email: email.trim(), password, role: selectedRole?.name })
      }
    } catch (err) {
      setError(err.message || 'Failed to save the user.')
    } finally {
      setIsSaving(false)
    }
  }

  async function copyCredentials() {
    const text = `VTPC Admin\nEmail: ${created.email}\nTemporary password: ${created.password}\n(You will be asked to choose a new password when you first sign in.)`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy automatically — please select and copy the details above.')
    }
  }

  if (isLoading) return <p className="text-center text-gray-600">Loading…</p>

  // One-time credentials screen: there is no invite email, so this is the only time the password is shown.
  if (created) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center rounded-2xl border border-brand-divider bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
          <span className="contact-success-pop flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={30} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-brand-dark">User created</h1>
          <p className="mt-1 text-sm text-gray-600">
            Share these details with {created.name}. The password won&apos;t be shown again, and they will be asked to
            choose their own when they first sign in.
          </p>
          <dl className="mt-5 w-full rounded-xl bg-brand-page p-4 text-left text-sm">
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-semibold text-brand-dark">{created.name}</dd>
            </div>
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-semibold text-brand-dark">{created.role}</dd>
            </div>
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-semibold break-all text-brand-dark">{created.email}</dd>
            </div>
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-gray-500">Temporary password</dt>
              <dd className="font-mono font-semibold text-brand-dark">{created.password}</dd>
            </div>
          </dl>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={copyCredentials}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-divider px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-page"
            >
              {copied ? <Check size={16} className="text-green-600" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy details'}
            </button>
            <Button type="button" onClick={() => navigate(ROUTES.ADMIN_USERS)}>
              Done
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link to={ROUTES.ADMIN_USERS} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary">
        <ArrowLeft size={16} />
        Back to Users
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit User' : 'Create User'}</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            placeholder="name@vtpc.gov.in"
            className={inputClass}
          />
          <span className="text-xs font-normal text-gray-500">They sign in with this email.</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Role
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={inputClass}>
            <option value="" disabled>
              Select a role…
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {role.isSystem ? ' (full access)' : ` — ${role.permissions?.length ?? 0} page${role.permissions?.length === 1 ? '' : 's'}`}
              </option>
            ))}
          </select>
          {selectedRole?.isSystem ? (
            <span className="text-xs font-normal text-amber-700">
              Super Admin can open every page, manage users and roles, and read the audit log.
            </span>
          ) : (
            selectedRole?.description && <span className="text-xs font-normal text-gray-500">{selectedRole.description}</span>
          )}
        </label>

        {!isEditMode && (
          <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            <label htmlFor="user-password">Temporary password</label>
            <div className="flex items-center gap-2">
              <span className="relative flex-1">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-brand-page"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPassword(generatePassword())
                  setShowPassword(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-divider px-3 py-2.5 text-sm font-medium text-brand-navy hover:bg-brand-page"
              >
                <Wand2 size={14} aria-hidden="true" />
                Generate
              </button>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-normal">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule} className={password && !problems.includes(rule) ? 'text-green-700' : 'text-gray-500'}>
                  {password && !problems.includes(rule) ? '✓' : '○'} {rule}
                </li>
              ))}
            </ul>
            <span className="text-xs font-normal text-gray-500">
              They&apos;ll be required to change it the first time they sign in.
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create User'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_USERS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
