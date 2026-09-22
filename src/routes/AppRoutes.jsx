import { Routes, Route } from 'react-router-dom'
import PublicRoutes from './PublicRoutes'
import AdminRoutes from './AdminRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  )
}
