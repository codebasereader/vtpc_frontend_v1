import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { home } from '../../../language/home'
import Hero from '../../../sections/Hero'
import ExportersGuide from '../../../sections/ExportersGuide'
import ExploreTradeProspects from '../../../sections/ExploreTradeProspects'
import KeyDriversGrowth from '../../../sections/KeyDriversGrowth'
import DistrictExplorer from '../../../sections/DistrictExplorer'
import SectorsTeaser from '../../../sections/SectorsTeaser'
import EventsTeaser from '../../../sections/EventsTeaser'

export default function Home() {
  const language = useSelector(selectLanguage)

  return (
    <>
      <Helmet>
        <title>VTPC — Visvesvaraya Trade Promotion Centre</title>
        <meta
          name="description"
          content="Visvesvaraya Trade Promotion Centre — Karnataka's gateway to global trade, exporter resources, and district-wise export data."
        />
      </Helmet>
      <Hero title={home.hero.title[language]} subtitle={home.hero.subtitle[language]} />
      <ExportersGuide />
      <ExploreTradeProspects />
      <KeyDriversGrowth />
      <DistrictExplorer />
      <SectorsTeaser />
      <EventsTeaser />
    </>
  )
}
