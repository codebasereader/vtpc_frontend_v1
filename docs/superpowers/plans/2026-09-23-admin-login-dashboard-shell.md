# Admin Login Integration & Dashboard Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing admin login flow to the real backend (not the
mock), make the session survive a page refresh, and build a real CMS
dashboard shell — sidebar nav across every content section, logout — so
each section's CRUD screens (built one at a time going forward) have a
working home to land in.

**Architecture:** Extends the existing `authSlice`/`ProtectedRoute`/
`AdminLayout` from the scaffold plan rather than replacing them. A new
`status` field on `authSlice` (`idle`/`checking`/`authenticated`/
`unauthenticated`) lets `ProtectedRoute` distinguish "haven't checked the
session yet" from "checked, not logged in" — without it, a valid session
would still bounce to `/admin/login` on every refresh while the async
session check is in flight. A shared `ADMIN_SECTIONS` list drives the
sidebar, the dashboard's link grid, and route registration from one place,
so adding a real section later (swapping its `ComingSoon` route for a real
page) never means updating three separate lists.

**Tech Stack:** Same as existing (Vite, React, Redux Toolkit, React
Router, Axios, Tailwind CSS v4, react-i18next). No new dependencies.

**Spec:** `docs/backend-api-contract.md` (auth flow, §3); real endpoints
confirmed live against `vtpc_backend_v1` on `http://localhost:4200`
(read-only reference — never edit that codebase, see
`docs/backend-requests/00-shared-infra.md` for what was found there).

**Prior plans:** `docs/superpowers/plans/2026-09-22-vtpc-scaffold-and-core.md`,
`docs/superpowers/plans/2026-09-22-vtpc-home-page.md` (both complete)

## Global Constraints

- No new tests (project policy, `react-frontend-builder` skill's
  "Testing" section) — implement directly, verify via `npm run lint`,
  `npm run build`, and manual browser checks against the real backend.
- Real backend confirmed live at `http://localhost:4200` (not 4000 — see
  `docs/backend-requests/00-shared-infra.md`). Real admin credentials for
  manual verification (local dev only): `editor@vtpc.gov.in` /
  `Admin@123`.
- Every backend response shape used below was read directly from
  `vtpc_backend_v1` source, not assumed: `POST /auth/login` → `{id, name,
  role}` on success, `{message}` on 401; `POST /auth/logout` → `{message}`;
  `GET /auth/me` → `{id, name, role}` on valid session, `{message}` + 401
  otherwise. `axiosClient`'s existing interceptor already normalizes every
  error response to `{message, status}`.
- Direct-value state setters for booleans (`setX(!x)`), not the functional
  updater form (`setX(prev => !prev)`) — this project hit a real React
  StrictMode double-invocation bug with the latter (documented in project
  memory and the `react-frontend-builder` skill).
- Mobile-first Tailwind, using the existing `@theme` brand tokens in
  `src/index.css` (`brand-primary`, `brand-navy`, `brand-navy-dark`,
  `brand-dark`, `brand-page`, `brand-surface`, etc.) — no new tokens
  needed.
- House folder structure (folder-per-component, `api/` layer, `constants/`
  for shared lists) as already established in this codebase.

---

## File Structure

```
src/
├── config/config.js                      # MODIFY: default API_BASE_URL -> :4200
├── redux/slices/authSlice.js              # MODIFY: add `status`, setCheckingSession
├── api/authApi.js                          # MODIFY: add getMe(), logout()
├── App.jsx                                  # MODIFY: mount SessionBootstrap
├── routes/
│   ├── ProtectedRoute.jsx                    # MODIFY: handle 'checking' status
│   └── AdminRoutes.jsx                        # MODIFY: register every section route
├── constants/
│   ├── routes.js                               # MODIFY: add ADMIN_* section paths
│   └── adminSections.js                         # CREATE: shared {key,title,path} list
├── layouts/AdminLayout/index.jsx                # REWRITE: sidebar + logout
└── pages/admin/
    ├── Dashboard/index.jsx                        # REWRITE: real landing page
    └── ComingSoon/index.jsx                        # CREATE: reusable placeholder
.env, .env.example                                   # MODIFY: port 4000 -> 4200
```

---

## Task 1: `authSlice` session status + `authApi` getMe/logout

**Files:**
- Modify: `src/redux/slices/authSlice.js`, `src/api/authApi.js`

**Interfaces:**
- Produces: `authSlice` initial state `{ user: null, isAuthenticated: false,
  status: 'idle' }`; actions `setCheckingSession()`, `setUser(user)` (now
  also sets `status: 'authenticated'`), `clearUser()` (now also sets
  `status: 'unauthenticated'`); new selector `selectAuthStatus(state)`.
  `authApi.getMe()` → resolves `{id, name, role}` or rejects `{message,
  status}` (401). `authApi.logout()` → resolves `{message}`.

- [x] **Step 1: Update `authSlice.js`**

```js
// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = { user: null, isAuthenticated: false, status: 'idle' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCheckingSession: (state) => {
      state.status = 'checking'
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.status = 'authenticated'
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = 'unauthenticated'
    },
  },
})

export const { setCheckingSession, setUser, clearUser } = authSlice.actions
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status
export default authSlice.reducer
```

- [x] **Step 2: Add `getMe`/`logout` to `authApi.js`**

```js
// src/api/authApi.js
import axiosClient from './axiosClient'

export function login({ email, password }) {
  return axiosClient.post('/auth/login', { email, password }).then((res) => res.data)
}

export function getMe() {
  return axiosClient.get('/auth/me').then((res) => res.data)
}

export function logout() {
  return axiosClient.post('/auth/logout').then((res) => res.data)
}
```

- [x] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add src/redux/slices/authSlice.js src/api/authApi.js
git commit -m "feat: add session status tracking and getMe/logout to auth"
```

---

## Task 2: Session bootstrap + `ProtectedRoute` checking-state

**Files:**
- Modify: `src/App.jsx`, `src/routes/ProtectedRoute.jsx`

**Interfaces:**
- Consumes: `getMe` (Task 1), `setCheckingSession`/`setUser`/`clearUser`
  (Task 1), `selectAuthStatus`/`selectIsAuthenticated` (Task 1).
- Produces: on every app load, exactly one `GET /auth/me` call resolves
  the real session state into Redux before `ProtectedRoute` makes any
  redirect decision.

- [x] **Step 1: Add `SessionBootstrap` and mount it in `App.jsx`**

```jsx
// src/App.jsx
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider, useDispatch } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { store } from './redux/store'
import i18n from './i18n'
import { LocaleProvider } from './context/LocaleContext'
import AppRoutes from './routes/AppRoutes'
import { getMe } from './api/authApi'
import { setCheckingSession, setUser, clearUser } from './redux/slices/authSlice'

function SessionBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCheckingSession())
    getMe()
      .then((user) => dispatch(setUser(user)))
      .catch(() => dispatch(clearUser()))
  }, [dispatch])

  return null
}

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <HelmetProvider>
            <BrowserRouter>
              <SessionBootstrap />
              <AppRoutes />
            </BrowserRouter>
          </HelmetProvider>
        </LocaleProvider>
      </I18nextProvider>
    </Provider>
  )
}

export default App
```

- [x] **Step 2: Update `ProtectedRoute.jsx` to wait for the session check**

```jsx
// src/routes/ProtectedRoute.jsx
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated, selectAuthStatus } from '../redux/slices/authSlice'
import { ROUTES } from '../constants/routes'

export default function ProtectedRoute({ children }) {
  const status = useSelector(selectAuthStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (status === 'idle' || status === 'checking') {
    return <p className="p-8 text-center">Loading…</p>
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  return children
}
```

- [x] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add src/App.jsx src/routes/ProtectedRoute.jsx
git commit -m "feat: rehydrate admin session on app load, gate ProtectedRoute on the check"
```

---

## Task 3: Point the frontend at the real backend port

**Files:**
- Modify: `src/config/config.js`, `.env`, `.env.example`

**Interfaces:**
- Produces: `API_BASE_URL` defaults to `http://localhost:4200` everywhere
  it's read from, matching the backend's actual running port (see
  `docs/backend-requests/00-shared-infra.md`).

- [x] **Step 1: Update the default in `config.js`**

```js
// src/config/config.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4200'
```

- [x] **Step 2: Update `.env` and `.env.example`**

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:4200
```

Apply the same change to the local `.env` file (gitignored, but keep it in
sync so `npm run dev` actually talks to the real backend).

- [x] **Step 3: Verify the real backend is reachable at that URL**

Run: `curl -s http://localhost:4200/health`
Expected: `{"ok":true,"service":"vtpc-api"}`. If this fails, the backend
isn't running — start it per `vtpc_backend_v1`'s own instructions before
continuing (do not edit anything there).

- [x] **Step 4: Commit**

```bash
git add src/config/config.js .env.example
git commit -m "chore: point frontend at the real backend's actual port (4200, not 4000)"
```

---

## Task 4: Shared admin sections list + routes

**Files:**
- Create: `src/constants/adminSections.js`
- Modify: `src/constants/routes.js`

**Interfaces:**
- Produces: `ROUTES.ADMIN_LEADERS`, `ROUTES.ADMIN_HOMEPAGE_CONTENT`,
  `ROUTES.ADMIN_DISTRICTS`, `ROUTES.ADMIN_FOCUS_SECTORS`,
  `ROUTES.ADMIN_GI_PRODUCTS`, `ROUTES.ADMIN_OFFICES`, `ROUTES.ADMIN_STAFF`,
  `ROUTES.ADMIN_EVENTS`, `ROUTES.ADMIN_DOWNLOADS`, `ROUTES.ADMIN_PAGES`,
  `ROUTES.ADMIN_NEWSLETTER` (all absolute, `/admin/...`). `ADMIN_SECTIONS`
  — an array of `{ key, title, path }`, one entry per CMS content type,
  `path` referencing the `ROUTES` constants above — the single source Task
  5 (routing), Task 6 (sidebar), and Task 7 (dashboard cards) all read
  from.

- [x] **Step 1: Add the admin section routes to `routes.js`**

```js
// src/constants/routes.js
export const ROUTES = {
  HOME: '/',
  ABOUT_US: '/about-us',
  EXPORTER_CORNER: '/exporter-corner',
  GEOGRAPHICAL_INDICATIONS: '/geographical-indications',
  DOWNLOADS: '/downloads',
  EVENTS: '/events',
  CONTACT: '/contact',
  PAGE: '/:slug',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LEADERS: '/admin/leaders',
  ADMIN_HOMEPAGE_CONTENT: '/admin/homepage-content',
  ADMIN_DISTRICTS: '/admin/districts',
  ADMIN_FOCUS_SECTORS: '/admin/focus-sectors',
  ADMIN_GI_PRODUCTS: '/admin/gi-products',
  ADMIN_OFFICES: '/admin/offices',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_DOWNLOADS: '/admin/downloads',
  ADMIN_PAGES: '/admin/pages',
  ADMIN_NEWSLETTER: '/admin/newsletter',
}
```

- [x] **Step 2: Create `adminSections.js`**

```js
// src/constants/adminSections.js
import { ROUTES } from './routes'

export const ADMIN_SECTIONS = [
  { key: 'leaders', title: 'Leaders', path: ROUTES.ADMIN_LEADERS },
  { key: 'homepageContent', title: 'Homepage Content', path: ROUTES.ADMIN_HOMEPAGE_CONTENT },
  { key: 'districts', title: 'Districts', path: ROUTES.ADMIN_DISTRICTS },
  { key: 'focusSectors', title: 'Focus Sectors', path: ROUTES.ADMIN_FOCUS_SECTORS },
  { key: 'giProducts', title: 'GI Products', path: ROUTES.ADMIN_GI_PRODUCTS },
  { key: 'offices', title: 'Offices', path: ROUTES.ADMIN_OFFICES },
  { key: 'staff', title: 'Staff', path: ROUTES.ADMIN_STAFF },
  { key: 'events', title: 'Events', path: ROUTES.ADMIN_EVENTS },
  { key: 'downloads', title: 'Downloads', path: ROUTES.ADMIN_DOWNLOADS },
  { key: 'pages', title: 'Pages', path: ROUTES.ADMIN_PAGES },
  { key: 'newsletter', title: 'Newsletter Subscribers', path: ROUTES.ADMIN_NEWSLETTER },
]
```

- [x] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors (unused-export warnings won't fire yet — `ADMIN_SECTIONS`
is consumed starting Task 5).

- [x] **Step 4: Commit**

```bash
git add src/constants/routes.js src/constants/adminSections.js
git commit -m "feat: add admin section route constants and shared ADMIN_SECTIONS list"
```

---

## Task 5: `ComingSoon` placeholder + register every section route

**Files:**
- Create: `src/pages/admin/ComingSoon/index.jsx`
- Modify: `src/routes/AdminRoutes.jsx`

**Interfaces:**
- Consumes: `ADMIN_SECTIONS` (Task 4).
- Produces: every `ROUTES.ADMIN_*` section path (Task 4) resolves to a
  real, protected route — `ComingSoon` for now, swapped for a real page
  one section at a time in future plans.

- [x] **Step 1: Implement `ComingSoon`**

```jsx
// src/pages/admin/ComingSoon/index.jsx
export default function ComingSoon({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">{title}</h1>
      <p className="mt-2 text-gray-600">This section isn't built yet — coming soon.</p>
    </div>
  )
}
```

- [x] **Step 2: Register every section route in `AdminRoutes.jsx`**

```jsx
// src/routes/AdminRoutes.jsx
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
```

- [x] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add src/pages/admin/ComingSoon src/routes/AdminRoutes.jsx
git commit -m "feat: register every CMS section route behind ComingSoon placeholders"
```

---

## Task 6: `AdminLayout` sidebar + logout

**Files:**
- Modify: `src/layouts/AdminLayout/index.jsx`

**Interfaces:**
- Consumes: `ADMIN_SECTIONS` (Task 4), `logout` (Task 1), `clearUser`/
  `selectCurrentUser` (Task 1/existing), `ROUTES.ADMIN_DASHBOARD`/
  `ROUTES.ADMIN_LOGIN` (existing/Task 4).
- Produces: the shell every admin route (Task 5, Dashboard) renders
  inside — desktop fixed sidebar, mobile collapsible via hamburger,
  working logout.

- [x] **Step 1: Rewrite `AdminLayout`**

```jsx
// src/layouts/AdminLayout/index.jsx
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ErrorBoundary from '../../components/ErrorBoundary'
import { logout } from '../../api/authApi'
import { clearUser, selectCurrentUser } from '../../redux/slices/authSlice'
import { ROUTES } from '../../constants/routes'
import { ADMIN_SECTIONS } from '../../constants/adminSections'

const navLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-brand-primary text-white' : 'text-gray-200 hover:bg-brand-navy-dark'}`

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Clear local state regardless — a failed logout request shouldn't
      // leave the admin stuck unable to sign out.
    }
    dispatch(clearUser())
    navigate(ROUTES.ADMIN_LOGIN)
  }

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-page md:flex">
      <header className="flex items-center justify-between bg-brand-navy px-4 py-3 text-white md:hidden">
        <span className="font-semibold">VTPC Admin</span>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          className="flex flex-col gap-1.5 p-2"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </header>

      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} w-full bg-brand-navy text-white md:block md:w-64 md:shrink-0`}>
        <div className="hidden px-4 py-4 text-lg font-semibold md:block">VTPC Admin</div>
        <nav className="flex flex-col gap-1 p-3">
          <NavLink to={ROUTES.ADMIN_DASHBOARD} className={navLinkClass} onClick={closeSidebar}>
            Dashboard
          </NavLink>
          {ADMIN_SECTIONS.map((section) => (
            <NavLink key={section.key} to={section.path} className={navLinkClass} onClick={closeSidebar}>
              {section.title}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          {currentUser && <p className="px-3 py-1 text-xs text-white/60">Signed in as {currentUser.name}</p>}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-brand-navy-dark"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
```

- [x] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add src/layouts/AdminLayout
git commit -m "feat: rebuild AdminLayout with a real sidebar and working logout"
```

---

## Task 7: Real `Dashboard` landing page

**Files:**
- Modify: `src/pages/admin/Dashboard/index.jsx`

**Interfaces:**
- Consumes: `ADMIN_SECTIONS` (Task 4), `selectCurrentUser` (existing).
- Produces: the page `ROUTES.ADMIN_DASHBOARD` renders — a welcome message
  plus a link card per CMS section.

- [x] **Step 1: Rewrite `Dashboard`**

```jsx
// src/pages/admin/Dashboard/index.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../../redux/slices/authSlice'
import { ADMIN_SECTIONS } from '../../../constants/adminSections'

export default function Dashboard() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">
        {currentUser ? `Welcome, ${currentUser.name}` : 'Dashboard'}
      </h1>
      <p className="mt-1 text-gray-600">Choose a section to manage.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.key}
            to={section.path}
            className="rounded-[5px] bg-white p-5 shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:bg-brand-surface"
          >
            <h2 className="font-semibold text-brand-primary">{section.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [x] **Step 2: Run lint, then a production build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: builds successfully.

- [x] **Step 3: Commit**

```bash
git add src/pages/admin/Dashboard
git commit -m "feat: rebuild admin Dashboard as a real section-links landing page"
```

---

## Task 8: Manual verification against the real backend

**Files:** none — verification only.

- [x] **Step 1: Confirm the real backend is running**

Run: `curl -s http://localhost:4200/health`
Expected: `{"ok":true,"service":"vtpc-api"}`

- [x] **Step 2: Start the frontend dev server**

Run: `npm run dev` (do **not** also start `npm run mock-api` for this
verification — the admin flow now targets the real backend on :4200).

- [x] **Step 3: Verify login against the real backend**

In a browser, go to `/admin/login`, sign in with `editor@vtpc.gov.in` /
`Admin@123`. Expected: redirects to `/admin/dashboard`, shows "Welcome,
Editor", sidebar lists all 11 sections plus Dashboard.

- [x] **Step 4: Verify session persists across a refresh**

Refresh the browser on `/admin/dashboard`. Expected: briefly shows
"Loading…", then the dashboard renders again — no bounce to `/admin/login`.
This is the real fix from Task 2; confirm it actually works against the
real cookie, not just in theory.

- [x] **Step 5: Verify a section link and the mobile sidebar**

Click "Leaders" in the sidebar. Expected: navigates to `/admin/leaders`,
shows the `ComingSoon` placeholder with the title "Leaders". Resize to a
mobile viewport (375px) — expected: sidebar collapses behind a hamburger
in the top header, toggles open/closed correctly (this project's earlier
StrictMode toggle bug means this must be checked, not assumed).

- [x] **Step 6: Verify logout**

Click "Log out". Expected: redirects to `/admin/login`; navigating back to
`/admin/dashboard` directly now redirects to `/admin/login` (session
actually cleared, not just local state).

- [x] **Step 7: Commit any fixes found during verification**

```bash
git add -A
git commit -m "fix: address issues found verifying admin login/dashboard against the real backend"
```

(Skip if Step 3–6 found nothing to fix.)

---

## Self-Review Notes

- **Spec coverage:** every item in the user's request — real login
  integration, session persistence across refresh, sidebar dashboard shell
  covering every CMS content type, logout — has a task. Individual CRUD
  screens per section are explicitly out of scope here (next plans, one
  section at a time, per direct user instruction).
- **Placeholder scan:** no "TBD"/"TODO". `ComingSoon` is a real, intentional
  placeholder component (not an unfinished implementation) — every route
  using it is fully wired (protected, in the sidebar, on the dashboard),
  only its content is intentionally minimal pending future plans.
- **Type consistency:** `ADMIN_SECTIONS` (Task 4) is the single list Tasks
  5, 6, and 7 all import — no duplicated section arrays to drift out of
  sync. `authSlice`'s `status` values (`'idle' | 'checking' | 'authenticated'
  | 'unauthenticated'`, Task 1) are read identically in `ProtectedRoute`
  (Task 2). `getMe()`/`logout()` (Task 1) resolve/reject in the same
  `{data} | {message, status}` shape every other `api/*.js` module already
  uses, via the existing `axiosClient` interceptor — no new error-handling
  pattern introduced.
