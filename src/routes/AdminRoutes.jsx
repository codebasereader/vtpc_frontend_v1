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
const OfficesList = lazy(() => import('../pages/admin/Offices/OfficesList'))
const OfficeForm = lazy(() => import('../pages/admin/Offices/OfficeForm'))
const OrgChartList = lazy(() => import('../pages/admin/OrgChart/OrgChartList'))
const OrgChartForm = lazy(() => import('../pages/admin/OrgChart/OrgChartForm'))
const GoverningCouncilList = lazy(() => import('../pages/admin/GoverningCouncil/GoverningCouncilList'))
const GoverningCouncilForm = lazy(() => import('../pages/admin/GoverningCouncil/GoverningCouncilForm'))
const TaluksList = lazy(() => import('../pages/admin/Taluks/TaluksList'))
const TalukForm = lazy(() => import('../pages/admin/Taluks/TalukForm'))
const WarehousesList = lazy(() => import('../pages/admin/Warehouses/WarehousesList'))
const WarehouseForm = lazy(() => import('../pages/admin/Warehouses/WarehouseForm'))
const GIProductsList = lazy(() => import('../pages/admin/GIProducts/GIProductsList'))
const GIProductForm = lazy(() => import('../pages/admin/GIProducts/GIProductForm'))
const DownloadCategoriesList = lazy(() => import('../pages/admin/DownloadCategories/DownloadCategoriesList'))
const DownloadCategoryForm = lazy(() => import('../pages/admin/DownloadCategories/DownloadCategoryForm'))
const DownloadsList = lazy(() => import('../pages/admin/Downloads/DownloadsList'))
const DownloadForm = lazy(() => import('../pages/admin/Downloads/DownloadForm'))
const PagesList = lazy(() => import('../pages/admin/Pages/PagesList'))
const PageForm = lazy(() => import('../pages/admin/Pages/PageForm'))
const NewsletterSubscribers = lazy(() => import('../pages/admin/Newsletter/NewsletterSubscribers'))
const NewsletterIssues = lazy(() => import('../pages/admin/Newsletter/NewsletterIssues'))
const VisitorAnalytics = lazy(() => import('../pages/admin/VisitorAnalytics'))

const BUILT_SECTIONS = [
  'leaders',
  'districts',
  'events',
  'cities',
  'eventSectors',
  'offices',
  'orgChart',
  'governingCouncil',
  'taluks',
  'warehouses',
  'giProducts',
  'downloadCategories',
  'downloads',
  'pages',
  'newsletterSubscribers',
  'newsletterIssues',
  'visitorAnalytics',
]
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
          <Route
            path="offices"
            element={
              <ProtectedRoute>
                <OfficesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="offices/new"
            element={
              <ProtectedRoute>
                <OfficeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="offices/:id/edit"
            element={
              <ProtectedRoute>
                <OfficeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="org-chart"
            element={
              <ProtectedRoute>
                <OrgChartList />
              </ProtectedRoute>
            }
          />
          <Route
            path="org-chart/new"
            element={
              <ProtectedRoute>
                <OrgChartForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="org-chart/:id/edit"
            element={
              <ProtectedRoute>
                <OrgChartForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="governing-council"
            element={
              <ProtectedRoute>
                <GoverningCouncilList />
              </ProtectedRoute>
            }
          />
          <Route
            path="governing-council/new"
            element={
              <ProtectedRoute>
                <GoverningCouncilForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="governing-council/:id/edit"
            element={
              <ProtectedRoute>
                <GoverningCouncilForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="taluks"
            element={
              <ProtectedRoute>
                <TaluksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="taluks/new"
            element={
              <ProtectedRoute>
                <TalukForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="taluks/:id/edit"
            element={
              <ProtectedRoute>
                <TalukForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouses"
            element={
              <ProtectedRoute>
                <WarehousesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouses/new"
            element={
              <ProtectedRoute>
                <WarehouseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouses/:id/edit"
            element={
              <ProtectedRoute>
                <WarehouseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="gi-products"
            element={
              <ProtectedRoute>
                <GIProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="gi-products/new"
            element={
              <ProtectedRoute>
                <GIProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="gi-products/:id/edit"
            element={
              <ProtectedRoute>
                <GIProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="download-categories"
            element={
              <ProtectedRoute>
                <DownloadCategoriesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="download-categories/new"
            element={
              <ProtectedRoute>
                <DownloadCategoryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="download-categories/:id/edit"
            element={
              <ProtectedRoute>
                <DownloadCategoryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="downloads"
            element={
              <ProtectedRoute>
                <DownloadsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="downloads/new"
            element={
              <ProtectedRoute>
                <DownloadForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="downloads/:id/edit"
            element={
              <ProtectedRoute>
                <DownloadForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="pages"
            element={
              <ProtectedRoute>
                <PagesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="pages/new"
            element={
              <ProtectedRoute>
                <PageForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="pages/:id/edit"
            element={
              <ProtectedRoute>
                <PageForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="newsletter-subscribers"
            element={
              <ProtectedRoute>
                <NewsletterSubscribers />
              </ProtectedRoute>
            }
          />
          <Route
            path="newsletter-issues"
            element={
              <ProtectedRoute>
                <NewsletterIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="visitor-analytics"
            element={
              <ProtectedRoute>
                <VisitorAnalytics />
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
