import {
  Users,
  Home,
  Map,
  Building2,
  Award,
  Building,
  IdCard,
  Calendar,
  FileDown,
  FileText,
} from 'lucide-react'
import { ROUTES } from './routes'

export const ADMIN_SECTIONS = [
  { key: 'leaders', title: 'Leaders', path: ROUTES.ADMIN_LEADERS, icon: Users },
  { key: 'homepageContent', title: 'Homepage Content', path: ROUTES.ADMIN_HOMEPAGE_CONTENT, icon: Home },
  { key: 'districts', title: 'Districts', path: ROUTES.ADMIN_DISTRICTS, icon: Map },
  { key: 'focusSectors', title: 'Focus Sectors', path: ROUTES.ADMIN_FOCUS_SECTORS, icon: Building2 },
  { key: 'giProducts', title: 'GI Products', path: ROUTES.ADMIN_GI_PRODUCTS, icon: Award },
  { key: 'offices', title: 'Offices', path: ROUTES.ADMIN_OFFICES, icon: Building },
  { key: 'staff', title: 'Staff', path: ROUTES.ADMIN_STAFF, icon: IdCard },
  { key: 'events', title: 'Events', path: ROUTES.ADMIN_EVENTS, icon: Calendar },
  { key: 'downloads', title: 'Downloads', path: ROUTES.ADMIN_DOWNLOADS, icon: FileDown },
  { key: 'pages', title: 'Pages', path: ROUTES.ADMIN_PAGES, icon: FileText },
]
