import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getHomepageContent } from '../../../api/homepageApi'

export default function Home() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    getHomepageContent()
      .then((data) => {
        if (isMounted) setContent(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load homepage content.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) return <p className="p-8 text-center">Loading…</p>
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>
  if (!content) return null

  return (
    <>
      <Helmet>
        <title>VTPC — Visvesvaraya Trade Promotion Centre</title>
        <meta
          name="description"
          content="Visvesvaraya Trade Promotion Centre — Karnataka's gateway to global trade, exporter resources, and district-wise export data."
        />
      </Helmet>
      <section className="px-4 py-12 text-center md:px-8">
        <h1 className="text-3xl font-bold text-blue-900">{content.hero.title}</h1>
        <p className="mt-2 text-gray-600">{content.hero.subtitle}</p>
      </section>
    </>
  )
}
