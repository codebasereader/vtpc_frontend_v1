import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getHomepageContent } from '../../../api/homepageApi'
import Hero from '../../../sections/Hero'
import ExportersGuide from '../../../sections/ExportersGuide'
import ExploreTradeProspects from '../../../sections/ExploreTradeProspects'
import KeyDriversGrowth from '../../../sections/KeyDriversGrowth'
import DistrictExplorer from '../../../sections/DistrictExplorer'
import SectorsTeaser from '../../../sections/SectorsTeaser'
import EventsTeaser from '../../../sections/EventsTeaser'

const DEFAULT_CONTENT = {
  hero: {
    title: 'Gateway to Global Markets: Exporters Guide',
    subtitle: 'Explore Unlimited Trade Prospects Worldwide',
  },
}

export default function Home() {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    let isMounted = true
    getHomepageContent()
      .then((data) => {
        if (isMounted && data?.hero) {
          setContent({ hero: data.hero })
        }
      })
      .catch(() => {
        // Keep defaults so the page still renders immediately.
      })
    return () => {
      isMounted = false
    }
  }, [])

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
      <ExportersGuide />
      <ExploreTradeProspects />
      <KeyDriversGrowth />
      <DistrictExplorer />
      <SectorsTeaser />
      <EventsTeaser />
    </>
  )
}
