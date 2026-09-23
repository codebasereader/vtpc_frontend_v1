import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import Home from '../pages/public/Home'
import NotFound from '../pages/public/NotFound'
import { ROUTES } from '../constants/routes'

export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
