import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../../api/authApi'
import { setUser } from '../../../redux/slices/authSlice'
import { ROUTES } from '../../../constants/routes'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'

const inputClass =
  'w-full rounded-lg border border-brand-divider bg-white py-3 pr-3 pl-10 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        <h2 className="text-2xl font-bold text-brand-navy-dark">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">Log in to manage the VTPC website.</p>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
        Email
        <span className="relative block">
          <Mail size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            placeholder="you@vtpc.gov.in"
            className={inputClass}
          />
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
        Password
        <span className="relative block">
          <Lock size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-brand-page hover:text-brand-dark"
          >
            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </span>
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(200,55,68,0.35)] transition-all hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Logging in…
          </>
        ) : (
          <>
            Log In <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
