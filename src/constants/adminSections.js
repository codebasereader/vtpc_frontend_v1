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
  MapPin,
  Tags,
} from 'lucide-react'
import { ROUTES } from './routes'

/**
 * Grouped admin navigation. Keep related CMS areas together so editors
 * can find homepage pieces (districts, leaders, etc.) under Home Page,
 * events under Events, and everything else under clear menus.
 */
export const ADMIN_NAV_GROUPS = [
  {
    id: 'home',
    label: 'Home Page',
    items: [
      { key: 'homepageContent', title: 'Homepage Content', path: ROUTES.ADMIN_HOMEPAGE_CONTENT, icon: Home },
      { key: 'leaders', title: 'Leaders', path: ROUTES.ADMIN_LEADERS, icon: Users },
      { key: 'districts', title: 'Districts', path: ROUTES.ADMIN_DISTRICTS, icon: Map },
      { key: 'focusSectors', title: 'Focus Sectors', path: ROUTES.ADMIN_FOCUS_SECTORS, icon: Building2 },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    items: [
      { key: 'events', title: 'Events', path: ROUTES.ADMIN_EVENTS, icon: Calendar },
      { key: 'cities', title: 'Cities', path: ROUTES.ADMIN_CITIES, icon: MapPin },
      { key: 'eventSectors', title: 'Event Sectors', path: ROUTES.ADMIN_EVENT_SECTORS, icon: Tags },
    ],
  },
  {
    id: 'organisation',
    label: 'Organisation',
    items: [
      { key: 'offices', title: 'Offices', path: ROUTES.ADMIN_OFFICES, icon: Building },
      { key: 'staff', title: 'Staff', path: ROUTES.ADMIN_STAFF, icon: IdCard },
    ],
  },
  {
    id: 'resources',
    label: 'Content & Resources',
    items: [
      { key: 'giProducts', title: 'GI Products', path: ROUTES.ADMIN_GI_PRODUCTS, icon: Award },
      { key: 'downloads', title: 'Downloads', path: ROUTES.ADMIN_DOWNLOADS, icon: FileDown },
      { key: 'pages', title: 'Pages', path: ROUTES.ADMIN_PAGES, icon: FileText },
    ],
  },
]

/** Flat list — used by Dashboard cards and route generation. */
export const ADMIN_SECTIONS = ADMIN_NAV_GROUPS.flatMap((group) => group.items)
