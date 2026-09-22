# VTPC Frontend — Scaffold & Core Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the VTPC React app skeleton — build tooling, folder
structure, routing (public + admin split), Redux store, i18n, the shared
Axios API client, base layouts/components, auth-gated admin routing, and a
local mock API server — so every subsequent page-building plan has a real,
running foundation to build against.

**Architecture:** One Vite + React (JS) single-page app. Two lazily-loaded
route trees (`PublicRoutes`, `AdminRoutes`) mounted under one `AppRoutes`,
sharing one Redux store, one Axios client, and one i18n instance. A local
`json-server` instance serves realistic seed data (pulled from the actual
WordPress source templates during spec research) that matches the backend
API contract, so frontend work is never blocked on the teammate's
Express/MongoDB backend being ready.

**Tech Stack:** Vite, React 18 (JavaScript), React Router v6, Redux Toolkit,
Axios, Tailwind CSS v4 (`@tailwindcss/vite`), react-i18next, react-helmet-async,
Vitest + @testing-library/react + jsdom, json-server (dev-only
mock API), ESLint + Prettier, npm.

**Spec:** `docs/superpowers/specs/2026-09-22-vtpc-frontend-design.md`

## Global Constraints

- Language: JavaScript only, no TypeScript (spec §2).
- Bundler/package manager: Vite + npm (spec §2).
- State: Redux Toolkit, flat `redux/slices/` — no feature-folder nesting
  (house convention, spec §2).
- Context usage stays narrow: theme, locale, modal/dialog visibility only —
  nothing else defaults to Context (spec §2, §3).
- Auth: httpOnly Secure cookie issued by the backend; the frontend never
  stores a raw token. Axios client always sends `withCredentials: true`.
  Redux auth state holds only `{ id, name, role, isAuthenticated }` (spec §2).
- No hardcoded URLs anywhere except `src/config/config.js`, which reads
  `VITE_API_BASE_URL` from the environment (house convention).
- Folder-per-component always, even for tiny components (house convention).
- Route-level code splitting: every entry in `AppRoutes` uses `React.lazy` +
  `Suspense` (house convention).
- Every async operation has explicit loading, error, and empty states (house
  convention).
- SEO is deprioritized this phase: `react-helmet-async` per-route
  `<title>`/description is enough — no SSR, no prerendering (spec §2).
- Mobile-first Tailwind: base (unprefixed) classes target phones first, then
  layer `sm:`/`md:`/`lg:`/`xl:` (house convention).

---

## File Structure

```
vtpc_frontend_v1/
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── vitest.config.js (or merged into vite.config.js)
├── .eslintrc / eslint config, .prettierrc
├── mock/
│   ├── db.json                      # json-server seed data, all 13 collections
│   └── routes.json                  # json-server custom route map (REST-ish paths)
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css                     # Tailwind entrypoint
    ├── config/
    │   └── config.js
    ├── api/
    │   ├── axiosClient.js
    │   ├── axiosClient.test.js
    │   ├── authApi.js
    │   └── homepageApi.js
    ├── redux/
    │   ├── store.js
    │   └── slices/
    │       ├── authSlice.js
    │       └── authSlice.test.js
    ├── context/
    │   ├── LocaleContext.jsx
    │   └── LocaleContext.test.jsx
    ├── i18n/
    │   ├── index.js
    │   └── locales/
    │       ├── en/common.json
    │       └── kn/common.json
    ├── constants/
    │   └── routes.js
    ├── routes/
    │   ├── AppRoutes.jsx
    │   ├── AppRoutes.test.jsx
    │   ├── PublicRoutes.jsx
    │   ├── AdminRoutes.jsx
    │   ├── ProtectedRoute.jsx
    │   └── ProtectedRoute.test.jsx
    ├── layouts/
    │   ├── PublicLayout/index.jsx
    │   ├── AdminLayout/index.jsx
    │   └── AuthLayout/index.jsx
    ├── components/
    │   ├── Button/index.jsx
    │   ├── Button/Button.test.jsx
    │   ├── ErrorBoundary/index.jsx
    │   └── ErrorBoundary/ErrorBoundary.test.jsx
    ├── sections/
    │   ├── Header/index.jsx
    │   ├── Header/Header.test.jsx
    │   ├── LanguageToggle/index.jsx
    │   ├── LanguageToggle/LanguageToggle.test.jsx
    │   └── Footer/index.jsx
    ├── pages/
    │   ├── public/
    │   │   ├── Home/index.jsx
    │   │   ├── Home/Home.test.jsx
    │   │   └── NotFound/index.jsx
    │   └── admin/
    │       ├── Login/index.jsx
    │       ├── Login/Login.test.jsx
    │       └── Dashboard/index.jsx
    └── test/
        └── setup.js                  # jsdom + testing-library matchers setup
```

---

## Task 1: Scaffold the Vite app and install the full dependency set

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`,
  `src/App.jsx`, `src/index.css`, `.gitignore`, `.eslintrc.*`, `.prettierrc`
- Test: `src/App.test.jsx` (trivial smoke test proving Vitest works)

**Interfaces:**
- Produces: a running `npm run dev` server and a running `npm test`
  command, both green, for every later task to build on.

- [x] **Step 1: Scaffold the Vite React template**

```bash
npm create vite@latest . -- --template react
```

- [x] **Step 2: Install runtime dependencies**

```bash
npm install @reduxjs/toolkit react-redux react-router-dom axios \
  react-i18next i18next react-helmet-async
```

- [x] **Step 3: Install dev dependencies (Tailwind, tests, lint/format, mock API)**

```bash
npm install -D tailwindcss @tailwindcss/vite eslint-config-prettier prettier \
  vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom json-server@0.17.4 cross-env
```

(`cross-env` sets `NODE_OPTIONS` portably in the `test` scripts below — see
the deviation note after Task 5 for why it's needed on Node 25+. `json-server`
is pinned to `0.17.4` rather than `@latest` — see the deviation note in
Task 13 for why the current `1.0.0-beta` release doesn't work for this mock
setup.)

- [x] **Step 4: Wire up Tailwind in `vite.config.js`**

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost/' },
    },
    setupFiles: './src/test/setup.js',
    globals: true,
  },
})
```

- [x] **Step 5: Add the Tailwind import to `src/index.css`**

```css
/* src/index.css */
@import "tailwindcss";
```

Delete the Vite template's default `src/App.css` and any boilerplate styles
in `src/index.css` it doesn't need — this file should contain only the
Tailwind import.

- [x] **Step 6: Create the Vitest setup file**

```js
// src/test/setup.js
import '@testing-library/jest-dom/vitest'
```

- [x] **Step 7: Add npm scripts**

In `package.json`, ensure the `scripts` block contains:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "cross-env NODE_OPTIONS=--no-experimental-webstorage vitest run",
    "test:watch": "cross-env NODE_OPTIONS=--no-experimental-webstorage vitest",
    "lint": "eslint .",
    "mock-api": "json-server --watch mock/db.json --routes mock/routes.json --port 4000"
  }
}
```

- [x] **Step 8: Replace `src/App.jsx` with a minimal placeholder**

```jsx
// src/App.jsx
function App() {
  return <div className="min-h-screen">VTPC</div>
}

export default App
```

- [x] **Step 9: Write the smoke test**

```jsx
// src/App.test.jsx
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('VTPC')).toBeInTheDocument()
  })
})
```

- [x] **Step 10: Run the test suite and verify it passes**

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

- [x] **Step 11: Verify the dev server starts**

Run: `npm run dev` (then stop it — this is a manual sanity check, not left
running)
Expected: Vite prints a local URL with no errors.

- [x] **Step 12: Add `.gitignore` and initialize git**

```
# .gitignore
node_modules
dist
.env
*.local
```

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React app with Tailwind and Vitest"
```

---

## Task 2: Target folder skeleton, `config.js`, and environment files

**Files:**
- Create: `src/config/config.js`, `.env.example`
- Modify: `.gitignore` (already ignores `.env`)

**Interfaces:**
- Produces: `API_BASE_URL` (string) — the single source of truth every API
  module in later tasks imports instead of hardcoding a URL.

- [x] **Step 1: Create `.env.example`**

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:4000
```

Copy it to a local `.env` (gitignored) with the same values for development.

- [x] **Step 2: Create `src/config/config.js`**

```js
// src/config/config.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
```

- [x] **Step 3: Create the remaining empty target folders**

```bash
mkdir -p src/api src/redux/slices src/context src/i18n/locales/en src/i18n/locales/kn \
  src/constants src/routes src/layouts src/components src/sections \
  src/pages/public src/pages/admin
```

- [x] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add config module, env template, and target folder structure"
```

---

## Task 3: Axios client

**Files:**
- Create: `src/api/axiosClient.js`
- Test: `src/api/axiosClient.test.js`

**Interfaces:**
- Consumes: `API_BASE_URL` from `src/config/config.js` (Task 2).
- Produces: default-exported `axiosClient` instance with `baseURL` set from
  config, `withCredentials: true`, and a response interceptor that rejects
  with a normalized `{ message, status }` error shape — every `api/*.js`
  module in later plans imports this instead of calling `axios` directly.

- [x] **Step 1: Write the failing test**

```js
// src/api/axiosClient.test.js
import axiosClient from './axiosClient'
import { API_BASE_URL } from '../config/config'

describe('axiosClient', () => {
  it('is configured with the base URL from config', () => {
    expect(axiosClient.defaults.baseURL).toBe(API_BASE_URL)
  })

  it('sends credentials with every request', () => {
    expect(axiosClient.defaults.withCredentials).toBe(true)
  })

  it('normalizes a rejected response into { message, status }', async () => {
    const handlers = axiosClient.interceptors.response.handlers
    const onRejected = handlers[0].rejected
    const fakeError = {
      response: { status: 404, data: { message: 'Not found' } },
    }
    await expect(onRejected(fakeError)).rejects.toEqual({
      message: 'Not found',
      status: 404,
    })
  })

  it('falls back to a generic message when the server sends none', async () => {
    const handlers = axiosClient.interceptors.response.handlers
    const onRejected = handlers[0].rejected
    const fakeError = { response: { status: 500, data: {} } }
    await expect(onRejected(fakeError)).rejects.toEqual({
      message: 'Something went wrong. Please try again.',
      status: 500,
    })
  })
})
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test -- axiosClient`
Expected: FAIL — `src/api/axiosClient.js` does not exist yet.

- [x] **Step 3: Implement `axiosClient.js`**

```js
// src/api/axiosClient.js
import axios from 'axios'
import { API_BASE_URL } from '../config/config'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.'
    return Promise.reject({ message, status })
  }
)

export default axiosClient
```

- [x] **Step 4: Run the test to verify it passes**

Run: `npm test -- axiosClient`
Expected: PASS, 4 tests.

- [x] **Step 5: Commit**

```bash
git add src/api/axiosClient.js src/api/axiosClient.test.js
git commit -m "feat: add shared Axios client with credential and error normalization"
```

---

## Task 4: Redux store and `authSlice`

**Files:**
- Create: `src/redux/store.js`, `src/redux/slices/authSlice.js`
- Test: `src/redux/slices/authSlice.test.js`

**Interfaces:**
- Produces: `store` (default export of `store.js`); from `authSlice.js`:
  reducer actions `setUser(payload)` and `clearUser()`, selector
  `selectIsAuthenticated(state)`, selector `selectCurrentUser(state)`. Later
  tasks (`ProtectedRoute`, `Login` page) depend on these exact names.

- [x] **Step 1: Write the failing test**

```js
// src/redux/slices/authSlice.test.js
import authReducer, { setUser, clearUser, selectIsAuthenticated, selectCurrentUser } from './authSlice'

describe('authSlice', () => {
  const initialState = { user: null, isAuthenticated: false }

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setUser stores the user and flips isAuthenticated to true', () => {
    const user = { id: '1', name: 'Editor', role: 'editor' }
    const state = authReducer(initialState, setUser(user))
    expect(state).toEqual({ user, isAuthenticated: true })
  })

  it('clearUser resets to the initial state', () => {
    const loggedIn = { user: { id: '1', name: 'Editor', role: 'editor' }, isAuthenticated: true }
    expect(authReducer(loggedIn, clearUser())).toEqual(initialState)
  })

  it('selectIsAuthenticated reads from state.auth', () => {
    const state = { auth: { user: null, isAuthenticated: true } }
    expect(selectIsAuthenticated(state)).toBe(true)
  })

  it('selectCurrentUser reads from state.auth', () => {
    const user = { id: '1', name: 'Editor', role: 'editor' }
    const state = { auth: { user, isAuthenticated: true } }
    expect(selectCurrentUser(state)).toEqual(user)
  })
})
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test -- authSlice`
Expected: FAIL — module does not exist.

- [x] **Step 3: Implement `authSlice.js`**

```js
// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = { user: null, isAuthenticated: false }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) => state.auth.user
export default authSlice.reducer
```

- [x] **Step 4: Implement `store.js`**

```js
// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})
```

- [x] **Step 5: Run the test to verify it passes**

Run: `npm test -- authSlice`
Expected: PASS, 5 tests.

- [x] **Step 6: Commit**

```bash
git add src/redux
git commit -m "feat: add Redux store and authSlice"
```

---

## Task 5: `LocaleContext` and i18n setup

**Files:**
- Create: `src/i18n/index.js`, `src/i18n/locales/en/common.json`,
  `src/i18n/locales/kn/common.json`, `src/context/LocaleContext.jsx`
- Test: `src/context/LocaleContext.test.jsx`

**Interfaces:**
- Produces: `LocaleProvider` (component), `useLocale()` hook returning
  `{ locale, setLocale }` where `locale` is `'en' | 'kn'`. Calling
  `setLocale('kn')` updates `i18next`'s active language and persists the
  choice to `localStorage` under the key `vtpc_locale`. Later tasks
  (`LanguageToggle`, `Header`) depend on this exact hook shape.

- [x] **Step 1: Write the failing test**

```jsx
// src/context/LocaleContext.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LocaleProvider, useLocale } from './LocaleContext'

function LocaleProbe() {
  const { locale, setLocale } = useLocale()
  return (
    <div>
      <span>{locale}</span>
      <button onClick={() => setLocale('kn')}>switch</button>
    </div>
  )
}

describe('LocaleContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to English', () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(screen.getByText('en')).toBeInTheDocument()
  })

  it('switches locale and persists it to localStorage', () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )
    fireEvent.click(screen.getByText('switch'))
    expect(screen.getByText('kn')).toBeInTheDocument()
    expect(localStorage.getItem('vtpc_locale')).toBe('kn')
  })

  it('reads a persisted locale on mount', () => {
    localStorage.setItem('vtpc_locale', 'kn')
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(screen.getByText('kn')).toBeInTheDocument()
  })
})
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test -- LocaleContext`
Expected: FAIL — module does not exist.

- [x] **Step 3: Create the seed translation files**

```json
// src/i18n/locales/en/common.json
{
  "nav": {
    "home": "Home",
    "aboutUs": "About Us",
    "exporterCorner": "Exporter Corner",
    "geographicalIndications": "Geographical Indications",
    "downloads": "Downloads",
    "events": "Events",
    "contact": "Contact Us"
  },
  "language": {
    "english": "English",
    "kannada": "ಕನ್ನಡ"
  }
}
```

```json
// src/i18n/locales/kn/common.json
{
  "nav": {
    "home": "ಮುಖಪುಟ",
    "aboutUs": "ನಮ್ಮ ಬಗ್ಗೆ",
    "exporterCorner": "ರಫ್ತುದಾರರ ಮೂಲೆ",
    "geographicalIndications": "ಭೌಗೋಳಿಕ ಸೂಚನೆಗಳು",
    "downloads": "ಡೌನ್‌ಲೋಡ್‌ಗಳು",
    "events": "ಕಾರ್ಯಕ್ರಮಗಳು",
    "contact": "ಸಂಪರ್ಕಿಸಿ"
  },
  "language": {
    "english": "English",
    "kannada": "ಕನ್ನಡ"
  }
}
```

- [x] **Step 4: Implement `src/i18n/index.js`**

```js
// src/i18n/index.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/common.json'
import kn from './locales/kn/common.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    kn: { common: kn },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
```

- [x] **Step 5: Implement `LocaleContext.jsx`**

```jsx
// src/context/LocaleContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import i18n from '../i18n'

const STORAGE_KEY = 'vtpc_locale'
const LocaleContext = createContext(null)

function readPersistedLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'kn' ? 'kn' : 'en'
  } catch {
    return 'en'
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readPersistedLocale)

  const setLocale = useCallback((nextLocale) => {
    setLocaleState(nextLocale)
    i18n.changeLanguage(nextLocale)
    try {
      localStorage.setItem(STORAGE_KEY, nextLocale)
    } catch {
      // localStorage unavailable (private browsing, etc.) — locale still
      // works for this session via React state.
    }
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
```

- [x] **Step 6: Run the test to verify it passes**

Run: `npm test -- LocaleContext`
Expected: PASS, 3 tests.

- [x] **Step 7: Commit**

```bash
git add src/i18n src/context
git commit -m "feat: add i18n setup and LocaleContext"
```

> **Deviation found during execution:** on Node 25, `localStorage` is a
> native global (`--webstorage`, on by default) that shadows jsdom's working
> implementation inside Vitest's jsdom environment, leaving `localStorage`
> present but with no methods (`.clear is not a function`). Fixed by adding
> `cross-env` as a dev dependency and running `test`/`test:watch` as
> `cross-env NODE_OPTIONS=--no-experimental-webstorage vitest ...`, plus
> `environmentOptions: { jsdom: { url: 'http://localhost/' } }` in
> `vite.config.js`'s `test` block. Both are already reflected in Task 1's
> dependency list and `vite.config.js` snippet for anyone re-running this
> plan from scratch.

---

## Task 6: Route constants and `ProtectedRoute`

**Files:**
- Create: `src/constants/routes.js`, `src/routes/ProtectedRoute.jsx`
- Test: `src/routes/ProtectedRoute.test.jsx`

**Interfaces:**
- Consumes: `selectIsAuthenticated` from `src/redux/slices/authSlice.js`
  (Task 4).
- Produces: `ROUTES` object (string path constants); `ProtectedRoute`
  component that renders `children` when `selectIsAuthenticated(state)` is
  true, otherwise redirects to `ROUTES.ADMIN_LOGIN`. Later admin pages wrap
  themselves in this.

- [x] **Step 1: Write the failing test**

```jsx
// src/routes/ProtectedRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import authReducer from '../redux/slices/authSlice'
import ProtectedRoute from './ProtectedRoute'

function renderWithAuth(isAuthenticated) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: isAuthenticated ? { id: '1', name: 'Editor', role: 'editor' } : null, isAuthenticated },
    },
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/login" element={<div>Login Page</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('ProtectedRoute', () => {
  it('renders the protected content when authenticated', () => {
    renderWithAuth(true)
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('redirects to the login route when not authenticated', () => {
    renderWithAuth(false)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
  })
})
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test -- ProtectedRoute`
Expected: FAIL — modules do not exist.

- [x] **Step 3: Implement `src/constants/routes.js`**

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
}
```

- [x] **Step 4: Implement `ProtectedRoute.jsx`**

```jsx
// src/routes/ProtectedRoute.jsx
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated } from '../redux/slices/authSlice'
import { ROUTES } from '../constants/routes'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  return children
}
```

- [x] **Step 5: Run the test to verify it passes**

Run: `npm test -- ProtectedRoute`
Expected: PASS, 2 tests.

- [x] **Step 6: Commit**

```bash
git add src/constants src/routes/ProtectedRoute.jsx src/routes/ProtectedRoute.test.jsx
git commit -m "feat: add route constants and ProtectedRoute guard"
```

---

## Task 7: `ErrorBoundary` and `Button` (first shared components)

**Files:**
- Create: `src/components/ErrorBoundary/index.jsx`,
  `src/components/ErrorBoundary/ErrorBoundary.test.jsx`,
  `src/components/Button/index.jsx`, `src/components/Button/Button.test.jsx`

**Interfaces:**
- Produces: `ErrorBoundary` (class component, `children` prop, catches
  render errors, shows a fallback message); `Button` (props: `children`,
  `variant` = `'primary' | 'secondary'` default `'primary'`, `...rest`
  spread onto the native `<button>`).

- [x] **Step 1: Write the failing tests**

```jsx
// src/components/ErrorBoundary/ErrorBoundary.test.jsx
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './index'

function Bomb() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders a fallback message when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
```

```jsx
// src/components/Button/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './index'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies the secondary variant class when requested', () => {
    render(<Button variant="secondary">Cancel</Button>)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('bg-white')
  })
})
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `npm test -- ErrorBoundary Button`
Expected: FAIL — modules do not exist.

- [x] **Step 3: Implement `ErrorBoundary`**

```jsx
// src/components/ErrorBoundary/index.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-6 text-center text-gray-700">
          Something went wrong. Please refresh the page.
        </div>
      )
    }
    return this.props.children
  }
}
```

- [x] **Step 4: Implement `Button`**

```jsx
// src/components/Button/index.jsx
const VARIANT_CLASSES = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  secondary: 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-50',
}

export default function Button({ children, variant = 'primary', className = '', ...rest }) {
  return (
    <button
      className={`rounded-md px-4 py-2 font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
```

- [x] **Step 5: Run the tests to verify they pass**

Run: `npm test -- ErrorBoundary Button`
Expected: PASS, 5 tests.

- [x] **Step 6: Commit**

```bash
git add src/components
git commit -m "feat: add ErrorBoundary and Button shared components"
```

---

## Task 8: `LanguageToggle` and `Header` sections

**Files:**
- Create: `src/sections/LanguageToggle/index.jsx`,
  `src/sections/LanguageToggle/LanguageToggle.test.jsx`,
  `src/sections/Header/index.jsx`, `src/sections/Header/Header.test.jsx`

**Interfaces:**
- Consumes: `useLocale` (Task 5), `useTranslation` from `react-i18next`,
  `ROUTES` (Task 6).
- Produces: `Header` — the public-site nav bar rendered by `PublicLayout`
  (Task 9).

- [x] **Step 1: Write the failing test for `LanguageToggle`**

```jsx
// src/sections/LanguageToggle/LanguageToggle.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import { LocaleProvider } from '../../context/LocaleContext'
import LanguageToggle from './index'

function renderToggle() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    </I18nextProvider>
  )
}

describe('LanguageToggle', () => {
  it('shows both language options', () => {
    renderToggle()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ಕನ್ನಡ' })).toBeInTheDocument()
  })

  it('switches the active language on click', () => {
    renderToggle()
    fireEvent.click(screen.getByRole('button', { name: 'ಕನ್ನಡ' }))
    expect(screen.getByRole('button', { name: 'ಕನ್ನಡ' })).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [x] **Step 2: Run it, verify it fails**

Run: `npm test -- LanguageToggle`
Expected: FAIL.

- [x] **Step 3: Implement `LanguageToggle`**

```jsx
// src/sections/LanguageToggle/index.jsx
import { useTranslation } from 'react-i18next'
import { useLocale } from '../../context/LocaleContext'

export default function LanguageToggle() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex gap-2" role="group" aria-label="Language">
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={`text-sm ${locale === 'en' ? 'font-semibold underline' : ''}`}
      >
        {t('language.english')}
      </button>
      <button
        type="button"
        aria-pressed={locale === 'kn'}
        onClick={() => setLocale('kn')}
        className={`text-sm ${locale === 'kn' ? 'font-semibold underline' : ''}`}
      >
        {t('language.kannada')}
      </button>
    </div>
  )
}
```

- [x] **Step 4: Run it, verify it passes**

Run: `npm test -- LanguageToggle`
Expected: PASS, 2 tests.

- [x] **Step 5: Write the failing test for `Header`**

```jsx
// src/sections/Header/Header.test.jsx
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../i18n'
import { LocaleProvider } from '../../context/LocaleContext'
import Header from './index'

describe('Header', () => {
  it('renders the primary nav links', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </LocaleProvider>
      </I18nextProvider>
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exporter Corner' })).toBeInTheDocument()
  })
})
```

- [x] **Step 6: Run it, verify it fails**

Run: `npm test -- Header`
Expected: FAIL.

- [x] **Step 7: Implement `Header`**

```jsx
// src/sections/Header/index.jsx
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import LanguageToggle from '../LanguageToggle'

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
  { key: 'downloads', to: ROUTES.DOWNLOADS },
  { key: 'events', to: ROUTES.EVENTS },
  { key: 'contact', to: ROUTES.CONTACT },
]

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
        Skip to content
      </a>
      <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
        <NavLink to={ROUTES.HOME} className="text-lg font-bold text-blue-800">
          VTPC
        </NavLink>
        <ul className="flex flex-wrap gap-4 text-sm">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? 'font-semibold text-blue-800' : 'text-gray-700')}
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageToggle />
      </nav>
    </header>
  )
}
```

- [x] **Step 8: Run it, verify it passes**

Run: `npm test -- Header`
Expected: PASS, 1 test.

- [x] **Step 9: Commit**

```bash
git add src/sections
git commit -m "feat: add LanguageToggle and Header sections"
```

---

## Task 9: `Footer` section and layouts

**Files:**
- Create: `src/sections/Footer/index.jsx`, `src/layouts/PublicLayout/index.jsx`,
  `src/layouts/AdminLayout/index.jsx`, `src/layouts/AuthLayout/index.jsx`

**Interfaces:**
- Consumes: `Header`, `Footer`, `ErrorBoundary`.
- Produces: `PublicLayout` (renders `Header` + `<Outlet/>` wrapped in
  `ErrorBoundary` + `Footer`), `AdminLayout` (renders a minimal admin shell +
  `<Outlet/>`), `AuthLayout` (centered card shell for `/admin/login`).

- [x] **Step 1: Implement `Footer`** (static links only for now — real
  `Page`-driven legal links arrive in the public-pages plan)

```jsx
// src/sections/Footer/index.jsx
export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-gray-50 px-4 py-8 text-sm text-gray-600 md:px-8">
      <p>&copy; {new Date().getFullYear()} Visvesvaraya Trade Promotion Centre, Government of Karnataka.</p>
    </footer>
  )
}
```

- [x] **Step 2: Implement `PublicLayout`**

```jsx
// src/layouts/PublicLayout/index.jsx
import { Outlet } from 'react-router-dom'
import Header from '../../sections/Header'
import Footer from '../../sections/Footer'
import ErrorBoundary from '../../components/ErrorBoundary'

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
    </div>
  )
}
```

- [x] **Step 3: Implement `AdminLayout`**

```jsx
// src/layouts/AdminLayout/index.jsx
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
```

- [x] **Step 4: Implement `AuthLayout`**

```jsx
// src/layouts/AuthLayout/index.jsx
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <Outlet />
      </div>
    </div>
  )
}
```

- [x] **Step 5: Commit**

(No new tests in this task — these are thin composition components already
covered indirectly by the `AppRoutes` integration test in Task 12; adding
this note explicitly so the reviewer knows the omission is intentional, not
missed.)

```bash
git add src/sections/Footer src/layouts
git commit -m "feat: add Footer section and Public/Admin/Auth layouts"
```

---

## Task 10: `authApi` and admin `Login` page

**Files:**
- Create: `src/api/authApi.js`, `src/pages/admin/Login/index.jsx`
- Test: `src/pages/admin/Login/Login.test.jsx`

**Interfaces:**
- Consumes: `axiosClient` (Task 3), `setUser` action (Task 4).
- Produces: `authApi.login({ email, password })` → resolves with
  `{ id, name, role }` (the cookie itself is set by the backend response,
  invisible to JS). `Login` page dispatches `setUser` on success and
  navigates to `ROUTES.ADMIN_DASHBOARD`.

- [x] **Step 1: Implement `authApi.js`** (thin wrapper, no branching logic
  to unit-test in isolation — covered via the `Login` page test's mock)

```js
// src/api/authApi.js
import axiosClient from './axiosClient'

export function login({ email, password }) {
  return axiosClient.post('/auth/login', { email, password }).then((res) => res.data)
}
```

- [x] **Step 2: Write the failing test for `Login`**

```jsx
// src/pages/admin/Login/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import authReducer from '../../../redux/slices/authSlice'
import * as authApi from '../../../api/authApi'
import Login from './index'

vi.mock('../../../api/authApi')

function renderLogin() {
  const store = configureStore({ reducer: { auth: authReducer } })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
  return store
}

describe('Login', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('logs in and navigates to the dashboard on success', async () => {
    authApi.login.mockResolvedValue({ id: '1', name: 'Editor', role: 'editor' })
    const store = renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'editor@vtpc.gov.in' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(store.getState().auth.isAuthenticated).toBe(true)
  })

  it('shows an error message on failed login', async () => {
    authApi.login.mockRejectedValue({ message: 'Invalid credentials', status: 401 })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'editor@vtpc.gov.in' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })
})
```

- [x] **Step 3: Run it, verify it fails**

Run: `npm test -- Login`
Expected: FAIL — `src/pages/admin/Login/index.jsx` does not exist.

- [x] **Step 4: Implement `Login`**

```jsx
// src/pages/admin/Login/index.jsx
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../../api/authApi'
import { setUser } from '../../../redux/slices/authSlice'
import { ROUTES } from '../../../constants/routes'
import Button from '../../../components/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const user = await login({ email, password })
      dispatch(setUser(user))
      navigate(ROUTES.ADMIN_DASHBOARD)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Admin Login</h1>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded border px-3 py-2"
        />
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in…' : 'Log In'}
      </Button>
    </form>
  )
}
```

- [x] **Step 5: Run it, verify it passes**

Run: `npm test -- Login`
Expected: PASS, 2 tests.

- [x] **Step 6: Commit**

```bash
git add src/api/authApi.js src/pages/admin/Login
git commit -m "feat: add authApi and admin Login page"
```

---

## Task 11: `Dashboard` and `NotFound` placeholders

**Files:**
- Create: `src/pages/admin/Dashboard/index.jsx`, `src/pages/public/NotFound/index.jsx`

**Interfaces:**
- Produces: minimal placeholder pages `AppRoutes` (Task 12) can route to;
  real dashboard content arrives in the admin-CRUD plan.

- [x] **Step 1: Implement `Dashboard`**

```jsx
// src/pages/admin/Dashboard/index.jsx
export default function Dashboard() {
  return <h1 className="text-xl font-semibold">Dashboard</h1>
}
```

- [x] **Step 2: Implement `NotFound`**

```jsx
// src/pages/public/NotFound/index.jsx
export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  )
}
```

- [x] **Step 3: Commit**

```bash
git add src/pages/admin/Dashboard src/pages/public/NotFound
git commit -m "feat: add Dashboard and NotFound placeholder pages"
```

---

## Task 12: `homepageApi`, `Home` placeholder page, and `AppRoutes` wiring

**Files:**
- Create: `src/api/homepageApi.js`, `src/pages/public/Home/index.jsx`,
  `src/pages/public/Home/Home.test.jsx`, `src/routes/PublicRoutes.jsx`,
  `src/routes/AdminRoutes.jsx`, `src/routes/AppRoutes.jsx`,
  `src/routes/AppRoutes.test.jsx`
- Modify: `src/App.jsx`, `src/main.jsx`

**Interfaces:**
- Consumes: `axiosClient` (Task 3), `ProtectedRoute` (Task 6), `PublicLayout`/
  `AdminLayout`/`AuthLayout` (Task 9), `Login`/`Dashboard`/`NotFound`
  (Tasks 10–11).
- Produces: the full route tree mounted at `App`. `homepageApi.getHomepageContent()`
  → resolves the `HomepageContent` singleton shape from spec §4
  (`{ hero: { title, subtitle }, highlights: [...] }`).

- [x] **Step 1: Implement `homepageApi.js`**

```js
// src/api/homepageApi.js
import axiosClient from './axiosClient'

export function getHomepageContent() {
  return axiosClient.get('/homepage-content').then((res) => res.data)
}
```

- [x] **Step 2: Write the failing test for `Home`**

```jsx
// src/pages/public/Home/Home.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import * as homepageApi from '../../../api/homepageApi'
import Home from './index'

vi.mock('../../../api/homepageApi')

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state, then the fetched hero content', async () => {
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Explore Unlimited Trade Prospects Worldwide' },
      highlights: [],
    })

    render(<Home />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
    expect(screen.getByText('Explore Unlimited Trade Prospects Worldwide')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', async () => {
    homepageApi.getHomepageContent.mockRejectedValue({ message: 'Network error', status: 0 })

    render(<Home />)
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
```

- [x] **Step 3: Run it, verify it fails**

Run: `npm test -- Home`
Expected: FAIL.

- [x] **Step 4: Implement `Home`**

```jsx
// src/pages/public/Home/index.jsx
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getHomepageContent } from '../../../api/homepageApi'

export default function Home() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    getHomepageContent()
      .then((data) => {
        if (isMounted) setContent(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load homepage content.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) return <p className="p-8 text-center">Loading…</p>
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>
  if (!content) return null

  return (
    <>
      <Helmet>
        <title>VTPC — Visvesvaraya Trade Promotion Centre</title>
        <meta
          name="description"
          content="Visvesvaraya Trade Promotion Centre — Karnataka's gateway to global trade, exporter resources, and district-wise export data."
        />
      </Helmet>
      <section className="px-4 py-12 text-center md:px-8">
        <h1 className="text-3xl font-bold text-blue-900">{content.hero.title}</h1>
        <p className="mt-2 text-gray-600">{content.hero.subtitle}</p>
      </section>
    </>
  )
}
```

- [x] **Step 5: Run it, verify it passes**

Run: `npm test -- Home`
Expected: PASS, 2 tests.

- [x] **Step 6: Implement `PublicRoutes.jsx`**

```jsx
// src/routes/PublicRoutes.jsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import { ROUTES } from '../constants/routes'

const Home = lazy(() => import('../pages/public/Home'))
const NotFound = lazy(() => import('../pages/public/NotFound'))

export default function PublicRoutes() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
```

(Other public routes — About Us, Exporter Corner, Geographical Indications,
Downloads, Events, Contact, legal `Page` slugs — are added in the
public-pages plan; wiring the whole `PublicLayout`/routing pattern now means
each later page is a one-line addition here.)

- [x] **Step 7: Implement `AdminRoutes.jsx`**

```jsx
// src/routes/AdminRoutes.jsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from '../constants/routes'

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
        </Route>
      </Routes>
    </Suspense>
  )
}
```

- [x] **Step 8: Implement `AppRoutes.jsx`**

```jsx
// src/routes/AppRoutes.jsx
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
```

- [x] **Step 9: Write the integration test for `AppRoutes`**

```jsx
// src/routes/AppRoutes.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { LocaleProvider } from '../context/LocaleContext'
import authReducer from '../redux/slices/authSlice'
import * as homepageApi from '../api/homepageApi'
import AppRoutes from './AppRoutes'

vi.mock('../api/homepageApi')

function renderAt(path, isAuthenticated = false) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null, isAuthenticated } },
  })
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
          </MemoryRouter>
        </LocaleProvider>
      </I18nextProvider>
    </Provider>
  )
}

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Sub' },
      highlights: [],
    })
  })

  it('renders Home at /', async () => {
    renderAt('/')
    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
  })

  it('renders NotFound for an unknown public path', async () => {
    renderAt('/nope')
    await waitFor(() => expect(screen.getByText('Page not found')).toBeInTheDocument())
  })

  it('redirects /admin/dashboard to /admin/login when unauthenticated', async () => {
    renderAt('/admin/dashboard', false)
    await waitFor(() => expect(screen.getByText('Admin Login')).toBeInTheDocument())
  })

  it('renders the admin dashboard when authenticated', async () => {
    renderAt('/admin/dashboard', true)
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })
})
```

- [x] **Step 10: Run it, verify it passes**

Run: `npm test -- AppRoutes`
Expected: PASS, 4 tests.

- [x] **Step 11: Wire `App.jsx` and `main.jsx`**

```jsx
// src/App.jsx
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { store } from './redux/store'
import i18n from './i18n'
import { LocaleProvider } from './context/LocaleContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <HelmetProvider>
            <BrowserRouter>
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

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

> **Deviation found during execution:** the user asked to drop Sentry
> mid-build. `@sentry/react` was removed from dependencies, `SENTRY_DSN` was
> removed from `config.js` and `.env.example`, and `main.jsx` above no
> longer initializes it — reflected in the snippets throughout this plan.
> If error monitoring is wanted later, it's a separate ask, not part of this
> plan.

- [x] **Step 12: Update `src/App.test.jsx`** (it now needs the full provider
  tree, so replace the Task 1 smoke test with one appropriate for the wired
  app)

```jsx
// src/App.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import * as homepageApi from './api/homepageApi'
import App from './App'

vi.mock('./api/homepageApi')

describe('App', () => {
  it('renders the Home page hero at the root path', async () => {
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Sub' },
      highlights: [],
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
  })
})
```

- [x] **Step 13: Run the full test suite**

Run: `npm test`
Expected: every test file passes.

- [x] **Step 14: Manual smoke check**

Run: `npm run dev`, open the printed URL, confirm the header/nav/footer
render and the Home hero shows a loading state (API not running yet — this
is expected until Task 13).

- [x] **Step 15: Commit**

```bash
git add src/api/homepageApi.js src/pages/public/Home src/routes src/App.jsx src/main.jsx src/App.test.jsx
git commit -m "feat: wire AppRoutes, Home page, and app providers"
```

---

## Task 13: Mock API server seeded with real reference data

**Files:**
- Create: `mock/db.json`, `mock/server.js`

**Interfaces:**
- Produces: a REST API on `http://localhost:4000` whose shape matches spec
  §4 exactly, so every `api/*.js` module written in this and future plans
  works against real (if provisional) responses.

> **Deviation found during execution:** the plan originally called for
> `json-server --routes mock/routes.json` (classic json-server 0.x CLI). The
> `json-server` version that installs today is `1.0.0-beta.x`, a full
> rewrite that dropped `--routes`, `--watch`, and all custom-route/middleware
> support — it can only auto-serve `/collectionName` from `db.json` with no
> rewriting and no way to mock the `/auth/login` POST at all. Fixed by
> pinning `json-server@0.17.4` (the last stable 0.x release) and replacing
> the planned `mock/routes.json` with a small `mock/server.js` that uses
> json-server programmatically (`jsonServer.create/router/rewriter`) plus a
> custom Express route for `/auth/login`. `package.json`'s `mock-api` script
> is `node mock/server.js` rather than a bare `json-server` CLI invocation.
> Anyone re-running this plan from scratch should install `json-server@0.17.4`
> explicitly rather than `json-server@latest`.

- [x] **Step 1: Create `mock/server.js`** (maps our REST-ish paths onto
  json-server's default `/collectionName` resources via `jsonServer.rewriter`
  — mostly 1:1, but `homepage-content` is a singleton — and adds a custom
  `/auth/login` POST handler, since that's an action endpoint, not a CRUD
  resource)

```js
// mock/server.js
import jsonServer from 'json-server'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'db.json')

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.use(
  jsonServer.rewriter({
    '/homepage-content': '/homepageContent',
    '/focus-sectors': '/focusSectors',
    '/focus-sectors/:id': '/focusSectors/:id',
    '/gi-products': '/giProducts',
    '/gi-products/:id': '/giProducts/:id',
    '/pages/:slug': '/pages?slug=:slug',
  })
)

server.post('/auth/login', (req, res) => {
  const db = router.db
  const user = db.get('authLogin').value()
  res.status(200).json(user)
})

server.use(router)

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`)
})
```

Update `package.json`'s `mock-api` script to `"node mock/server.js"`.

- [x] **Step 2: Create `mock/db.json`** with realistic seed data — district,
  sector, and GI product entries use the real figures captured from the
  live WordPress templates during spec research; other collections use
  clearly-generic placeholder entries to be replaced once real content is
  migrated.

```json
{
  "homepageContent": {
    "hero": {
      "title": "Gateway to Global Markets: Exporters Guide",
      "subtitle": "Explore Unlimited Trade Prospects Worldwide"
    },
    "highlights": [
      { "title": "Diverse Economy", "description": "Karnataka's economy spans agriculture, industry, and services." },
      { "title": "Innovation Hub", "description": "Home to India's leading technology and biotech clusters." },
      { "title": "Agricultural Bounty", "description": "A major producer of coffee, spices, and horticultural crops." },
      { "title": "Strategic Location", "description": "Well-connected ports and logistics corridors for exporters." }
    ]
  },
  "districts": [
    {
      "id": "kalaburagi",
      "name": "Kalaburagi",
      "tagline": { "en": "Tur Bowl of Karnataka", "kn": "" },
      "totalExportValueCr": 129.67,
      "countries": [
        { "name": "Indonesia", "percentage": 32.19 },
        { "name": "Malaysia", "percentage": 10.96 },
        { "name": "Bangladesh", "percentage": 9.03 },
        { "name": "Tanzania", "percentage": 5.47 },
        { "name": "Egypt", "percentage": 5.21 }
      ],
      "products": [
        { "name": "Salt, Sulphur, Earths and Stone, Plastering Materials, LIM", "percentage": 32.19 },
        { "name": "Sugars and Sugar Confectionery", "percentage": 22.80 },
        { "name": "Miscellaneous Chemical Products", "percentage": 22.17 },
        { "name": "Others", "percentage": 20.64 }
      ],
      "sectors": [
        { "name": "Agriculture", "percentage": 25.9 },
        { "name": "Industry (Secondary)", "percentage": 19.1 },
        { "name": "Services (Tertiary)", "percentage": 55 }
      ]
    },
    {
      "id": "bengaluru-urban",
      "name": "Bengaluru Urban",
      "tagline": { "en": "IT capital of India", "kn": "" },
      "totalExportValueCr": 0,
      "countries": [],
      "products": [],
      "sectors": []
    }
  ],
  "focusSectors": [
    {
      "id": "pharmaceutical-biotech",
      "name": { "en": "Pharmaceutical & Biotech", "kn": "" },
      "image": "/assets/sectors/pharma.jpg",
      "description": {
        "en": "Karnataka, India's biotechnology hub, houses a large number of biotech firms, research institutions, and startups. Major players like Biocon, Strides Pharma, Aurobindo Pharma, Novartis, AstraZeneca, and Merck have a strong presence in the state.",
        "kn": ""
      },
      "statBoxes": [
        { "value": "40%", "label": { "en": "of Pharma products exported overseas", "kn": "" } },
        { "value": "~10%", "label": { "en": "of Export Revenues of Pharma products from Karnataka", "kn": "" } },
        { "value": "02", "label": { "en": "Pharma parks located in Hassan and Bangalore", "kn": "" } }
      ],
      "yearlyChart": [
        { "year": "FY-2020", "valueUsdMn": 846.58 },
        { "year": "FY-2021", "valueUsdMn": 879.07 },
        { "year": "FY-2022", "valueUsdMn": 859.57 },
        { "year": "FY-2023", "valueUsdMn": 1039.27 }
      ],
      "topMarkets": [{ "country": "USA", "percentage": 31.93 }],
      "keyInsights": { "en": "Sample seed content — replace once migrated via the CMS.", "kn": "" }
    }
  ],
  "giProducts": [
    {
      "id": "bidriware",
      "name": { "en": "Bidriware", "kn": "" },
      "category": "Handicraft",
      "image": "/assets/gi/bidriware.jpg",
      "summary": {
        "en": "Exclusive to Bidar, 15th century capital town of Bahamani Sultan, bidriware requires a special skill called damascening in silver.",
        "kn": ""
      },
      "story": {
        "en": "Bidriware, a unique metal craft exclusive to Bidar, traces its roots back to the 15th century during the reign of Ahmed Shah Bahamani. Made by inlaying silver on to a blackened alloy, its unique oxidation process uses soil from Bidar Fort.",
        "kn": ""
      }
    },
    {
      "id": "mysore-silk",
      "name": { "en": "Mysore Silk", "kn": "" },
      "category": "Textile",
      "image": "/assets/gi/mysore-silk.jpg",
      "summary": {
        "en": "Mysore Silk is renowned for its premium quality and lustrous texture, produced by the Karnataka Silk Industries Corporation (KSIC).",
        "kn": ""
      },
      "story": {
        "en": "The silk sarees are made from pure mulberry silk, produced by silkworms fed on mulberry leaves. The process involves intricate weaving techniques and often includes pure gold zari work.",
        "kn": ""
      }
    }
  ],
  "pages": [
    {
      "slug": "privacy-policies",
      "title": { "en": "Privacy Policy", "kn": "" },
      "body": { "en": "Sample seed content — replace with the real policy text once migrated via the CMS.", "kn": "" }
    }
  ],
  "leaders": [
    { "id": "1", "name": "Sample Chief Minister", "designation": { "en": "Hon'ble Chief Minister of Karnataka", "kn": "" }, "photo": "", "order": 1 }
  ],
  "offices": [
    { "id": "1", "name": "Head Office", "city": "Bengaluru", "address": { "en": "Sample address, Bengaluru", "kn": "" }, "phone": "", "email": "", "mapLink": "" }
  ],
  "staff": [
    { "id": "1", "name": "Sample Chairman", "role": "Chairman", "group": "org-chart", "order": 1, "photo": "" }
  ],
  "events": [
    { "id": "1", "title": { "en": "Sample Trade Expo", "kn": "" }, "date": "2026-11-01", "location": { "en": "Bengaluru", "kn": "" }, "description": { "en": "Sample seed content.", "kn": "" }, "registrationLink": "" }
  ],
  "downloads": [
    { "id": "1", "title": { "en": "Industrial Policy 2025-2030", "kn": "" }, "category": "Policy", "fileUrl": "", "uploadedAt": "2025-06-01" }
  ],
  "authLogin": { "id": "1", "name": "Sample Editor", "role": "editor" }
}
```

- [x] **Step 3: Run the mock server and verify real responses**

Run: `npm run mock-api` (in one terminal), then in another:

```bash
curl http://localhost:4000/homepage-content
curl http://localhost:4000/districts
curl "http://localhost:4000/pages/privacy-policies"
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"x","password":"y"}'
```

Expected: each returns the matching JSON from `db.json` (the login POST
returns the `authLogin` fixture regardless of credentials — this is a local
dev mock, not real auth).

- [x] **Step 4: Run the app against the mock API**

With `npm run mock-api` still running, run `npm run dev`, open the app, and
confirm: the Home page renders "Gateway to Global Markets: Exporters Guide"
instead of staying on the loading state; the language toggle switches the
nav to Kannada; and logging in at `/admin/login` with any email/password
reaches `/admin/dashboard`. Verified in a real browser (Playwright) — all
three passed, including the Node-25 `localStorage` fix from Task 5 not
regressing anything here.

- [x] **Step 5: Commit**

```bash
git add mock package.json package-lock.json index.html
git commit -m "chore: add mock API server seeded with reference site data"
```

(The `index.html` fix folded in here — its `<title>` was still the
temp-scaffold-folder name `scaffold-tmp` left over from Task 1's move-out-of-
subfolder trick; caught while eyeballing the browser tab during this step's
manual check.)

---

## Task 14: Lint/format pass and final verification

**Files:**
- Modify: any files flagged by lint/format

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no errors. Fix any issues found (unused imports, etc.) and re-run
until clean.

- [ ] **Step 2: Run the full test suite one more time**

Run: `npm test`
Expected: all test files pass, no skipped/todo tests.

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: builds successfully into `dist/`, no errors.

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes"
```

(Skip this commit if Step 1 found nothing to fix.)

---

## Self-Review Notes

- **Spec coverage:** house stack (Vite/JS/Tailwind/Redux Toolkit/React
  Router/Axios/npm) — Task 1. Folder structure — Tasks 1–12 build it
  incrementally per spec §3. httpOnly-cookie auth pattern — Task 3 (`withCredentials`)
  + Task 4 (`authSlice` never stores a token) + Task 10 (`Login`). Narrow
  Context usage (locale only, so far) — Task 5. Public/admin route split —
  Task 12. i18n — Task 5 + Task 8. `react-helmet-async` per route — Task 12
  (`Home`). Content model /
  API contract shape — Task 13 seed data mirrors spec §4 field names exactly.
  Remaining spec sections (full sitemap, admin CRUD, district map UI, sector
  charts, GI browser) are explicitly deferred to the two follow-up plans
  named in this plan's intro — not gaps, by design.
- **Placeholder scan:** no "TBD"/"TODO" in any step; seed-data placeholders
  in Task 13 are clearly labeled as sample content for local dev, not
  implementation stubs.
- **Type consistency:** `authApi.login` return shape (`{ id, name, role }`)
  matches what `setUser` (Task 4) and the `authLogin` mock fixture (Task 13)
  provide. `ROUTES.ADMIN_LOGIN` (`/admin/login`) matches the path
  `AdminRoutes` (Task 12) mounts `Login` at (`/admin/*` + `login` →
  `/admin/login`). `useLocale()`'s `{ locale, setLocale }` shape is used
  identically in `LanguageToggle` (Task 8) and its own test (Task 5).
