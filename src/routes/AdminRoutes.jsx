import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import ComingSoon from '../pages/admin/ComingSoon'
import { ADMIN_SECTIONS } from '../constants/adminSections'

const Login = lazy(() => import('../pages/admin/Login'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))
const LeadersList = lazy(() => import('../pages/admin/Leaders/LeadersList'))
const LeaderForm = lazy(() => import('../pages/admin/Leaders/LeaderForm'))
const DistrictsList = lazy(() => import('../pages/admin/Districts/DistrictsList'))
const DistrictForm = lazy(() => import('../pages/admin/Districts/DistrictForm'))
const EventsList = lazy(() => import('../pages/admin/Events/EventsList'))
const EventForm = lazy(() => import('../pages/admin/Events/EventForm'))
const CitiesList = lazy(() => import('../pages/admin/Cities/CitiesList'))
const CityForm = lazy(() => import('../pages/admin/Cities/CityForm'))
const EventSectorsList = lazy(() => import('../pages/admin/EventSectors/EventSectorsList'))
const EventSectorForm = lazy(() => import('../pages/admin/EventSectors/EventSectorForm'))

const BUILT_SECTIONS = ['leaders', 'districts', 'events', 'cities', 'eventSectors']
const COMING_SOON_SECTIONS = ADMIN_SECTIONS.filter((section) => !BUILT_SECTIONS.includes(section.key))

export default function AdminRoutes() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaders"
            element={
              <ProtectedRoute>
                <LeadersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaders/new"
            element={
              <ProtectedRoute>
                <LeaderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaders/:id/edit"
            element={
              <ProtectedRoute>
                <LeaderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="districts"
            element={
              <ProtectedRoute>
                <DistrictsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="districts/new"
            element={
              <ProtectedRoute>
                <DistrictForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="districts/:id/edit"
            element={
              <ProtectedRoute>
                <DistrictForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="events"
            element={
              <ProtectedRoute>
                <EventsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="events/new"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="events/:id/edit"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="cities"
            element={
              <ProtectedRoute>
                <CitiesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="cities/new"
            element={
              <ProtectedRoute>
                <CityForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="cities/:id/edit"
            element={
              <ProtectedRoute>
                <CityForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="event-sectors"
            element={
              <ProtectedRoute>
                <EventSectorsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="event-sectors/new"
            element={
              <ProtectedRoute>
                <EventSectorForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="event-sectors/:id/edit"
            element={
              <ProtectedRoute>
                <EventSectorForm />
              </ProtectedRoute>
            }
          />
          {COMING_SOON_SECTIONS.map((section) => (
            <Route
              key={section.key}
              path={section.path.replace('/admin/', '')}
              element={
                <ProtectedRoute>
                  <ComingSoon title={section.title} />
                </ProtectedRoute>
              }
            />
          ))}
        </Route>
      </Routes>
    </Suspense>
  )
}
