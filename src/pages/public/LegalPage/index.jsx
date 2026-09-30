import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { FileText } from 'lucide-react'
import { getPageBySlug } from '../../../api/pagesApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { getBilingualText } from '../../../lib/bilingual'
import { ROUTES } from '../../../constants/routes'

export default function LegalPage() {
  const { slug } = useParams()
  // Keyed by slug so navigating between policy pages remounts fresh state
  // instead of an effect needing to imperatively reset it mid-life.
  return <LegalPageContent key={slug} slug={slug} />
}

function LegalPageContent({ slug }) {
  const language = useSelector(selectLanguage)
  const [page, setPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getPageBySlug(slug)
      .then((data) => {
        if (isMounted) setPage(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.status === 404 ? 'not-found' : err.message || 'Failed to load page.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [slug])

  const title = page ? getBilingualText(page.title, language) : ''
  const bodyHtml = page ? getBilingualText(page.body, language) || getBilingualText(page.body, 'en') : ''

  return (
    <>
      <Helmet>
        <title>{title || 'Page'} — VTPC Karnataka</title>
      </Helmet>

      <section className="bg-brand-navy-dark px-4 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          {isLoading ? (
            <div className="h-9 w-64 animate-pulse rounded bg-white/15" />
          ) : (
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">{title}</h1>
          )}
        </div>
      </section>

      <section className="bg-brand-page px-4 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-brand-divider bg-white p-6 shadow-[0_8px_24px_rgba(15,40,80,0.06)] md:p-10">
          {isLoading && <p className="text-center text-gray-600">Loading…</p>}

          {!isLoading && error === 'not-found' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-page text-gray-400">
                <FileText size={22} aria-hidden="true" />
              </span>
              <p className="text-gray-600">This page hasn't been published yet.</p>
              <Link to={ROUTES.HOME} className="text-sm font-semibold text-brand-primary hover:underline">
                Back to Home
              </Link>
            </div>
          )}

          {!isLoading && error && error !== 'not-found' && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          {!isLoading && !error && page && (
            <div
              className="legal-content"
              // Content is CMS-authored by the admin team, not user input.
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          )}
        </div>
      </section>
    </>
  )
}
