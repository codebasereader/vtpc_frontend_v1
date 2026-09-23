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

const BUILT_SECTIONS = ['leaders', 'districts']
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
