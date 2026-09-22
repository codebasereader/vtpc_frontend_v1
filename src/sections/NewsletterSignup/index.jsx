import { useState } from 'react'
import { subscribeToNewsletter } from '../../api/newsletterApi'
import Button from '../../components/Button'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      await subscribeToNewsletter({ email })
      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section className="bg-brand-navy px-4 py-12 text-center text-white md:px-8">
      <h2 className="text-2xl font-bold md:text-3xl">Subscribe to our Newsletter!</h2>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md px-3 py-2 text-brand-dark"
        />
        <Button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>
      {status === 'success' && <p className="mt-3 text-sm">Thanks for subscribing!</p>}
      {status === 'error' && <p className="mt-3 text-sm text-red-200">{error}</p>}
    </section>
  )
}
