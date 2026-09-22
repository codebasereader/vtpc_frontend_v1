# VTPC Frontend Rebuild — Design Spec

Date: 2026-09-22
Status: Approved by user, ready for implementation planning

## 1. Background

VTPC (Visvesvaraya Trade Promotion Centre, Government of Karnataka) currently
runs on WordPress at `vtpc.karnataka.gov.in`. We are rebuilding it as a React
frontend, with a separate Node/Express + MongoDB backend (built by a
teammate) providing a real CMS. This spec covers the **frontend only** and
the **data contract** the backend needs to satisfy.

### 1.1 What we learned inspecting the reference site and its source code

- WordPress 6.8.1, custom theme `VTPC`, no page builder (hand-coded PHP
  templates), plugins limited to Akismet, Contact Form 7, Duplicator.
- The database (`vtpc1.sql`, reference dump) contains only **18 pages**, **3
  posts**, and **68 media attachments** in `wp_posts`. There are **no custom
  post types and no custom DB tables** — everything else (district export
  data, focus sector stats, GI product stories, events) is **hardcoded
  directly into PHP templates** (`template/home.php` alone is 2,904 lines).
- Practical implication: the current site is *not* a working CMS for most of
  its content. Making these sections genuinely data-driven via MongoDB +
  admin CRUD is new value, not a like-for-like port.
- The current site has **zero SEO meta** (no `<meta name="description">`, no
  Open Graph tags) — an easy improvement, though SEO is explicitly
  deprioritized for this build per the user's direction (see §2).
- Reference assets available locally for extraction (images, the Karnataka
  district SVG map, PDFs, copy text): `E:\vtpc.karnataka.gov.in Source Code\`
  (full WordPress export + `dup-database` SQL) and
  `E:\vtpc-sourcecode-folder\` (`vtpc1.sql`, plus a `.rar` full site backup
  and a forms export zip).

## 2. Decisions locked in

| Area | Decision |
|---|---|
| Framework | Vite + React (JavaScript, not TypeScript) — single SPA |
| State | Redux Toolkit (flat `redux/slices/`) |
| Routing | React Router |
| HTTP | Axios, single client in `api/axiosClient.js` |
| Styling | Tailwind CSS |
| Package manager | npm |
| Context usage | Narrow: theme, locale, modal/dialog visibility only |
| Auth | httpOnly, Secure cookie issued by the Express backend; frontend never touches the raw token; Redux holds `{ id, name, role, isAuthenticated }` only |
| i18n | English + Kannada, `react-i18next`, current language held in `LocaleContext` |
| App structure | **One Vite app**, two route trees: `pages/public/*` (open) and `pages/admin/*` (CMS dashboard, behind `ProtectedRoute`, lazy-loaded) |
| SEO | Deprioritized for this phase — reasonable basics only (semantic HTML, `react-helmet-async` per-route `<title>`/description, alt text). No SSR/prerendering, no rebuild-on-publish pipeline. Revisit later if needed. |
| Error monitoring | `@sentry/react`, gated on a configured DSN |
| Hosting target | Undecided, likely NIC/state data centre — build output stays a portable static bundle regardless (a plain SPA build satisfies this without extra constraints, now that prerendering is off the table) |

## 3. Folder structure

Extends the house standard as-is, with the public/admin split:

```
src/
├── api/
│   ├── axiosClient.js
│   ├── authApi.js
│   ├── pagesApi.js
│   ├── districtsApi.js
│   ├── sectorsApi.js
│   ├── giProductsApi.js
│   ├── eventsApi.js
│   ├── downloadsApi.js
│   ├── officesApi.js
│   ├── staffApi.js
│   ├── homepageApi.js
│   ├── enquiriesApi.js
│   └── newsletterApi.js
├── components/            # generic, reusable (Button, Modal, Card, Tabs, Accordion, DataTable)
├── sections/               # composed, page-specific blocks (Hero, DistrictExplorer, SectorTabs, GIProductGrid, EventList, Footer)
├── pages/
│   ├── public/             # Home, AboutUs, ExporterCorner, GeographicalIndications, Downloads, Events, Contact, LegalPage (slug-driven)
│   └── admin/               # Login, Dashboard, and one CRUD screen per collection
├── layouts/                # PublicLayout, AdminLayout, AuthLayout
├── routes/                  # AppRoutes.jsx, ProtectedRoute.jsx, PublicRoutes.jsx, AdminRoutes.jsx
├── redux/
│   ├── store.js
│   └── slices/               # authSlice, localeSlice(if needed beyond context), uiSlice
├── context/                 # ThemeContext, LocaleContext, ModalContext
├── lib/                      # formatters, validators, hooks (useDistrictMap, useDebounce, etc.)
├── constants/                 # ROUTES, DISTRICT_LIST, LANGUAGES
├── config/
│   └── config.js
├── i18n/
│   ├── index.js
│   ├── locales/en/*.json
│   └── locales/kn/*.json
├── assets/
└── styles/
```

## 4. Content model / API contract

This is what the backend (Node/Express + MongoDB) needs to expose. Every
translatable field is an object `{ en, kn }`; the frontend renders based on
the active locale.

| Collection | Key fields | Replaces |
|---|---|---|
| `Page` | `slug`, `title{en,kn}`, `body{en,kn}` (rich text) | The 18 static WP pages: Privacy/Security/Copyright/Hyperlinking/Terms policies, Help, Screen Reader Access |
| `Leader` | `name`, `designation{en,kn}`, `photo`, `order` | CM / Dy.CM / Minister carousel (currently hardcoded — must not be, changes with reshuffles) |
| `District` | `name`, `tagline{en,kn}`, `totalExportValueCr` (number, INR Crores), `countries: [{name, percentage}]`, `products: [{name, percentage}]`, `sectors: [{name, percentage}]` | The 30-district interactive export map/panel (currently ~2,900 lines of hardcoded HTML per district) |
| `FocusSector` | `name{en,kn}`, `image`, `description{en,kn}`, `statBoxes: [{value, label{en,kn}}]`, `yearlyChart: [{year, valueUsdMn}]`, `topMarkets: [{country, percentage}]`, `keyInsights{en,kn}` | The 8 "Champion Service Sectors" (Pharma & Biotech, Electrical Machinery, etc.) |
| `GIProduct` | `name{en,kn}`, `category`, `image`, `summary{en,kn}` (short, list card), `story{en,kn}` (longer, "Learn more" modal) | The ~25 Geographical Indications entries (Bidriware, Mysore Silk, ...) |
| `Enquiry` | `productRef`, `name`, `email`, `phone`, `message`, `createdAt` | The GI product "Enquire Now" modal form submissions |
| `Office` | `name`, `city`, `address{en,kn}`, `phone`, `email`, `mapLink` | The 5 regional offices (Bengaluru HQ, Dharwad, Mysuru, Kalaburgi, Mangalore) |
| `StaffMember` | `name`, `role`, `group` (`org-chart` \| `governing-council`), `order`, `photo?` | About Us org chart + governing council |
| `Event` | `title{en,kn}`, `date`, `location{en,kn}`, `description{en,kn}`, `registrationLink` | "Upcoming Events at a Glance" |
| `Download` | `title{en,kn}`, `category` (`Policy` \| `RTI` \| `Report` \| `Form`), `fileUrl`, `uploadedAt` | The 118-document Downloads/RTI library |
| `HomepageContent` | singleton: hero copy, Karnataka-highlight cards (Diverse Economy, Innovation Hub, Agricultural Bounty, Strategic Location), Economic Survey stat block | Homepage narrative copy that today is hardcoded strings |
| `NewsletterSubscriber` | `email`, `subscribedAt` | Newsletter signup form |
| `AdminUser` | `email`, `passwordHash` (backend-only), `role` | CMS login |

External/unchanged (kept as outbound links, not migrated into our CMS):
RTI Online, RTI Login, RTI Statistics — these point to
`rtionline.karnataka.gov.in` / `rtistats.karnataka.gov.in`, and the
"Guidelines" link points to `industries.karnataka.gov.in`. Not our data.

This contract will be handed to the teammate building the Express/MongoDB
backend; frontend work can start against a mock JSON server using this same
shape while the real API is built in parallel.

## 5. Sitemap (public site)

- `/` — Home (leadership carousel, hero, Karnataka highlights, district
  export explorer, champion sectors teaser, upcoming events, newsletter)
- `/about-us` — org chart, governing council, 5 regional offices
- `/exporter-corner` — market intelligence, warehouse facilities, 8 focus
  sectors (tabbed detail view with chart + top markets + insights)
- `/geographical-indications` — GI product grid + detail/modal view
- `/downloads` — filterable document library (Policy/RTI/Report/Form)
- `/events` — full events listing (home only teases upcoming ones)
- `/contact` — regional offices + contact form
- `/{slug}` — generic legal/info pages driven by the `Page` collection
  (privacy-policy, security-policy, copyright-policy, hyperlinking-policy,
  terms-conditions, screen-reader-access, help)

Admin (`/admin/...`): login, dashboard, one list+edit screen per collection
above, file upload for `Download`/images, bilingual (en/kn) fields side by
side in the editor, subscriber list with CSV export.

## 6. Notable UI engineering

- **District export explorer**: interactive Karnataka map (SVG, reuse/trace
  the existing district paths from the reference theme's assets) with
  click/tap-to-select districts and a data panel — driven by the `District`
  API data instead of hardcoded markup.
- **Focus sector tabs**: tabbed/accordion UI per sector with a bar chart
  (year → USD Mn) — use a lightweight chart lib (e.g. Recharts), loaded via
  dynamic `import()` per the house performance rules so it doesn't bloat the
  main bundle.
- **GI product browser**: category-filterable grid, detail panel/modal with
  "Learn more" (longer story) and "Enquire Now" (submits to the `Enquiry`
  API).
- **Downloads library**: category filter + search over the `Download`
  collection.

## 7. i18n approach

`react-i18next` for static UI strings (nav, buttons, labels) in
`i18n/locales/{en,kn}/*.json`. CMS content fields carry both languages in
the same document (`{en, kn}`), so switching locale re-renders with the
already-fetched data — no duplicate API calls. `LocaleContext` holds the
active language and persists the choice (e.g. `localStorage`, read
defensively per the artifact/browser-storage caution — this is a real app,
not an artifact, so plain `localStorage` with a try/catch is fine).

## 8. Accessibility & performance

Per the house defaults (semantic HTML, keyboard operability, WCAG AA
contrast, visible focus states, alt text, mobile-first Tailwind, route-level
code splitting, lazy image loading, narrow Redux selectors). Additionally,
since this is a `karnataka.gov.in` property: keep a genuine
**Screen Reader Access** page and a skip-to-content link (both present on
the current site) — likely expected under GIGW (Government of India
guidelines for government websites), even though full GIGW/WCAG audit is
out of scope for this phase.

## 9. Out of scope for this phase

- SSR/prerendering and any rebuild-on-publish pipeline (explicitly
  deprioritized).
- Actual SQL → MongoDB data migration execution (teammate's backend task);
  this spec only defines the target shape the frontend expects.
- Translating existing English content into Kannada (content authoring is a
  client/editor task once the CMS is live); the frontend and content model
  just need to support it structurally.
- Redesigning the Karnataka district SVG map artwork from scratch — reuse
  the shapes from the reference site's theme assets if usable, otherwise
  flag for a redrawn/licensed asset.

## 10. Open items for the user to confirm during build

- Exact visual redesign direction (colors/typography) — will be proposed
  during implementation per the house "Design taste" defaults unless
  reference-site brand colors should be kept for continuity.
- Whether the 5 regional offices need a contact form per office or one
  shared form.
- Final admin role model (single "editor" role assumed sufficient for now).
