import { Outlet } from 'react-router-dom'
import Header from '../../sections/Header'
import Footer from '../../sections/Footer'
import ErrorBoundary from '../../components/ErrorBoundary'
import FloatingContactButton from '../../components/FloatingContactButton'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <FloatingContactButton />
    </div>
  )
}
