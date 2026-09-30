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
    ],
  },
  {
    id: 'resources',
    label: 'Content & Resources',
    items: [
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

/** Flat list — used by Dashboard cards and route generation. */
export const ADMIN_SECTIONS = ADMIN_NAV_GROUPS.flatMap((group) => group.items)
