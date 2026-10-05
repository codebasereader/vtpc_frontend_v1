import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import Home from '../pages/public/Home'
import Events from '../pages/public/Events'
import AboutUs from '../pages/public/AboutUs'
import GeographicalIndications from '../pages/public/GeographicalIndications'
import Downloads from '../pages/public/Downloads'
import LegalPage from '../pages/public/LegalPage'
import FormPage from '../pages/public/FormPage'
import NotFound from '../pages/public/NotFound'
import KalalokaUnavailable from '../pages/public/KalalokaUnavailable'
import { ROUTES } from '../constants/routes'

// Lazy-loaded — pulls in leaflet + recharts, which only this page needs.
// Every other public page stays eagerly bundled with the app shell.
const ExporterCorner = lazy(() => import('../pages/public/ExporterCorner'))

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.EVENTS} element={<Events />} />
        <Route path={ROUTES.ABOUT_US} element={<AboutUs />} />
        <Route path={ROUTES.GEOGRAPHICAL_INDICATIONS} element={<GeographicalIndications />} />
        <Route path={ROUTES.DOWNLOADS} element={<Downloads />} />
        <Route
          path={ROUTES.EXPORTER_CORNER}
          element={
            <Suspense fallback={<p className="p-16 text-center text-gray-600">Loading…</p>}>
              <ExporterCorner />
            </Suspense>
          }
        />
        <Route path="kalaloka/*" element={<KalalokaUnavailable />} />
        <Route path={ROUTES.FORM} element={<FormPage />} />
        <Route path={ROUTES.PAGE} element={<LegalPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
