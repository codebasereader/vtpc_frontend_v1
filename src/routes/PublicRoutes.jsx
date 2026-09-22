import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import { ROUTES } from '../constants/routes'

const Home = lazy(() => import('../pages/public/Home'))
const NotFound = lazy(() => import('../pages/public/NotFound'))

export default function PublicRoutes() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
