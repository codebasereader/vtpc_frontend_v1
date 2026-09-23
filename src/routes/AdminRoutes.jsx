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

const COMING_SOON_SECTIONS = ADMIN_SECTIONS.filter((section) => section.key !== 'leaders')

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
