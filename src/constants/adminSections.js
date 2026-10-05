import {
  Users,
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
  Signpost,
  Warehouse,
  FolderTree,
  Mail,
  Send,
  MailCheck,
  BarChart3,
  MessageSquare,
  PhoneCall,
  ClipboardList,
  UserCog,
  ShieldCheck,
  KeyRound,
  ScrollText,
  ChartColumn,
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
      { key: 'orgChart', title: 'Org Chart', path: ROUTES.ADMIN_ORG_CHART, icon: IdCard },
      {
        key: 'governingCouncil',
        title: 'Governing Council',
        path: ROUTES.ADMIN_GOVERNING_COUNCIL,
        icon: Users,
      },
    ],
  },
  {
    id: 'exporterCorner',
    label: 'Exporter Corner',
    items: [
      { key: 'taluks', title: 'Taluks', path: ROUTES.ADMIN_TALUKS, icon: Signpost },
      { key: 'warehouses', title: 'Warehouses', path: ROUTES.ADMIN_WAREHOUSES, icon: Warehouse },
      { key: 'marketData', title: 'Market Data', path: ROUTES.ADMIN_MARKET_DATA, icon: ChartColumn },
    ],
  },
  {
    id: 'resources',
    label: 'Content & Resources',
    items: [
      { key: 'forms', title: 'Forms', path: ROUTES.ADMIN_FORMS, icon: ClipboardList },
      { key: 'giProducts', title: 'GI Products', path: ROUTES.ADMIN_GI_PRODUCTS, icon: Award },
      { key: 'giEnquiries', title: 'GI Enquiries', path: ROUTES.ADMIN_GI_ENQUIRIES, icon: MessageSquare },
      {
        key: 'downloadCategories',
        title: 'Download Categories',
        path: ROUTES.ADMIN_DOWNLOAD_CATEGORIES,
        icon: FolderTree,
      },
      { key: 'downloads', title: 'Downloads', path: ROUTES.ADMIN_DOWNLOADS, icon: FileDown },
      { key: 'pages', title: 'Pages', path: ROUTES.ADMIN_PAGES, icon: FileText },
    ],
  },
  {
    id: 'siteAndNewsletter',
    label: 'Site & Newsletter',
    items: [
      {
        key: 'contactEnquiries',
        title: 'Contact Enquiries',
        path: ROUTES.ADMIN_CONTACT_ENQUIRIES,
        icon: PhoneCall,
      },
      {
        key: 'newsletterSubscribers',
        title: 'Newsletter Subscribers',
        path: ROUTES.ADMIN_NEWSLETTER_SUBSCRIBERS,
        icon: Mail,
      },
      {
        key: 'newsletterIssues',
        title: 'Send Newsletter',
        path: ROUTES.ADMIN_NEWSLETTER_ISSUES,
        icon: Send,
      },
      {
        key: 'newslettersSent',
        title: 'Sent Newsletters',
        path: ROUTES.ADMIN_NEWSLETTERS_SENT,
        icon: MailCheck,
      },
      {
        key: 'visitorAnalytics',
        title: 'Visitor Analytics',
        path: ROUTES.ADMIN_VISITOR_ANALYTICS,
        icon: BarChart3,
      },
    ],
  },
]

/**
 * Access-control area — Super Admin only (never grantable to a role), so
 * these items are flagged instead of being part of the permission catalog.
 */
const ACCESS_CONTROL_GROUP = {
  id: 'accessControl',
  label: 'Access Control',
  superAdminOnly: true,
  items: [
    { key: 'users', title: 'Users', path: ROUTES.ADMIN_USERS, icon: UserCog, superAdminOnly: true },
    { key: 'roles', title: 'Roles', path: ROUTES.ADMIN_ROLES, icon: ShieldCheck, superAdminOnly: true },
    { key: 'roleAccess', title: 'Role Access', path: ROUTES.ADMIN_ROLE_ACCESS, icon: KeyRound, superAdminOnly: true },
    { key: 'auditLogs', title: 'Audit Logs', path: ROUTES.ADMIN_AUDIT_LOGS, icon: ScrollText, superAdminOnly: true },
  ],
}

ADMIN_NAV_GROUPS.push(ACCESS_CONTROL_GROUP)

/** Flat list — used by Dashboard cards and route generation. */
export const ADMIN_SECTIONS = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

/** Grantable pages (everything except the Super-Admin-only area), grouped like the sidebar. */
export const PERMISSION_GROUPS = ADMIN_NAV_GROUPS.filter((group) => !group.superAdminOnly)

/** The section a pathname belongs to (e.g. /admin/forms/12/edit → forms), or null. */
export function sectionForPath(pathname) {
  return (
    ADMIN_SECTIONS.find((section) => pathname === section.path || pathname.startsWith(`${section.path}/`)) || null
  )
}
