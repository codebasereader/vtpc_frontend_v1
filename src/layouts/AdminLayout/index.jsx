import { Outlet } from 'react-router-dom'
import ErrorBoundary from '../../components/ErrorBoundary'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 px-4 py-3 text-white md:px-8">
        <span className="font-semibold">VTPC Admin</span>
      </header>
      <main className="p-4 md:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
