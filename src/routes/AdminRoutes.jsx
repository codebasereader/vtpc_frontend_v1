import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import ComingSoon from '../pages/admin/ComingSoon'
import { ADMIN_SECTIONS } from '../constants/adminSections'

const Login = lazy(() => import('../pages/admin/Login'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))

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
          {ADMIN_SECTIONS.map((section) => (
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
