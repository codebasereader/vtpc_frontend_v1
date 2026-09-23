import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getHomepageContent } from '../../../api/homepageApi'
import Hero from '../../../sections/Hero'
import KarnatakaHighlights from '../../../sections/KarnatakaHighlights'
import DistrictExplorer from '../../../sections/DistrictExplorer'
import SectorsTeaser from '../../../sections/SectorsTeaser'
import EventsTeaser from '../../../sections/EventsTeaser'
import NewsletterSignup from '../../../sections/NewsletterSignup'

export default function Home() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
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
      <Hero title={content.hero.title} subtitle={content.hero.subtitle} />
      <KarnatakaHighlights highlights={content.highlights} />
      <DistrictExplorer />
      <SectorsTeaser />
      <EventsTeaser />
      <NewsletterSignup />
    </>
  )
}
