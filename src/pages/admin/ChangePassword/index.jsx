import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react'
import { changePassword } from '../../../api/authApi'
import { selectCurrentUser, setUser } from '../../../redux/slices/authSlice'
import { ROUTES } from '../../../constants/routes'
import { passwordProblems } from '../../../lib/password'
import Button from '../../../components/Button'

const inputClass =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

function PasswordField({ label, value, onChange, autoComplete, hint }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
      {label}
      <span className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-brand-page"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
      {hint && <span className="text-xs font-normal text-gray-500">{hint}</span>}
    </label>
  )
}

export default function ChangePassword() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [done, setDone] = useState(false)

  const forced = Boolean(user?.mustChangePassword)
  const problems = newPassword ? passwordProblems(newPassword) : []

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (passwordProblems(newPassword).length > 0) {
      setError('Please choose a stronger password.')
      return
    }
    if (newPassword !== confirm) {
      setError('The new passwords do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setError('The new password must be different from the current one.')
      return
    }
    setIsSaving(true)
    try {
      await changePassword({ currentPassword, newPassword })
      dispatch(setUser({ ...user, mustChangePassword: false }))
      setDone(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      if (forced) setTimeout(() => navigate(ROUTES.ADMIN_DASHBOARD, { replace: true }), 900)
    } catch (err) {
      setError(err.message || 'Failed to change the password.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
          <KeyRound size={20} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{forced ? 'Set a new password' : 'Change password'}</h1>
          <p className="text-sm text-gray-600">
            {forced
              ? 'An administrator gave you a temporary password. Choose your own to continue.'
              : 'Use a strong password you don’t use anywhere else.'}
          </p>
        </div>
      </div>

      {done && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
          <CheckCircle2 size={16} aria-hidden="true" />
          Password changed.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-divider bg-white p-5">
        <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
        <PasswordField label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        {newPassword && (
          <ul className="-mt-2 flex flex-col gap-1 text-xs">
            {['At least 8 characters', 'Contains a letter', 'Contains a number'].map((rule) => (
              <li key={rule} className={problems.includes(rule) ? 'text-gray-500' : 'text-green-700'}>
                {problems.includes(rule) ? '○' : '✓'} {rule}
              </li>
            ))}
          </ul>
        )}
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <Button type="submit" disabled={isSaving || !currentPassword || !newPassword || !confirm} className="w-fit">
          {isSaving ? 'Saving…' : 'Change password'}
        </Button>
      </form>
    </div>
  )
}
