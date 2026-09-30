import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { home } from '../../../language/home'
import Hero from '../../../sections/Hero'
import FormsMarquee from '../../../sections/FormsMarquee'
import ExportersGuide from '../../../sections/ExportersGuide'
import ExploreTradeProspects from '../../../sections/ExploreTradeProspects'
import KeyDriversGrowth from '../../../sections/KeyDriversGrowth'
import DistrictExplorer from '../../../sections/DistrictExplorer'
import ChampionServiceSectors from '../../../sections/ChampionServiceSectors'
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
      {/* Marquee (active forms) sits right under the header menu; the hero video fills the rest of the first screen. */}
      <div className="flex h-[calc(100svh-11rem)] min-h-[420px] flex-col sm:min-h-[520px]">
        <FormsMarquee />
        <Hero title={home.hero.title[language]} subtitle={home.hero.subtitle[language]} />
      </div>
      <ExportersGuide />
      <ExploreTradeProspects />
      <KeyDriversGrowth />
      <DistrictExplorer />
      <ChampionServiceSectors />
      <EventsTeaser />
    </>
  )
}
