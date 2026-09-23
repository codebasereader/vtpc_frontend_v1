import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../../api/authApi'
import { setUser } from '../../../redux/slices/authSlice'
import { ROUTES } from '../../../constants/routes'
import Button from '../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const user = await login({ email, password })
      dispatch(setUser(user))
      navigate(ROUTES.ADMIN_DASHBOARD)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold text-brand-primary">VTPC Admin</p>
        <h1 className="mt-1 text-xl font-bold text-brand-dark">Log in to your account</h1>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
      </label>
      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Logging in…' : 'Log In'}
      </Button>
    </form>
  )
}
