# VTPC Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real VTPC Home page — brand-accurate design tokens, real
images/video from the reference site, leadership carousel, hero, Karnataka
highlights, the interactive district export explorer, a champion-sectors
teaser, an events teaser, and a newsletter signup — replacing the
placeholder Home page from the scaffold plan.

**Architecture:** Extends the scaffold's `PublicLayout` → `pages/public/Home`
composition. Home becomes a thin page that composes six new `sections/`
components, each fetching its own data through a new `api/*.js` module
(mirroring the existing `homepageApi.js` pattern) with explicit
loading/error/empty states. Tailwind gets brand tokens via the CSS-first
`@theme` block (Tailwind v4 — no `tailwind.config.js` needed) so every
component can use `bg-brand-primary`, `text-brand-primary`, etc.

**Tech Stack:** Same as the scaffold (Vite, React, Redux Toolkit, React
Router, Axios, Tailwind CSS v4, react-i18next, Vitest + @testing-library/react).
Adds `ffmpeg-static` (dev dependency, portable ffmpeg binary — no system
install needed) for one-time video re-encoding.

**Spec:** `docs/superpowers/specs/2026-09-22-vtpc-frontend-design.md`
(§5 sitemap, §6 "District export explorer", §7 i18n)

**Prior plan:** `docs/superpowers/plans/2026-09-22-vtpc-scaffold-and-core.md`
(all 14 tasks complete — this plan builds directly on that codebase)

## Global Constraints

- Design fidelity: **close visual replication** of the reference site (user
  decision, 2026-09-22) — real brand colors/fonts/spacing from the actual
  theme CSS, not a free modern reinterpretation. The district explorer
  (Task 8) is built from directly-inspected reference CSS; the other
  sections (hero, highlights, carousels, teasers) use the same brand tokens
  and the house spacing/shadow/radius conventions consistently, without
  transcribing every reference CSS rule line-by-line — see each task's
  "Reference" note for exactly what was inspected.
- Brand tokens (extracted from the reference theme's `style.css`, confirmed
  by hex frequency and matched against real class rules — not guessed):
  primary `#C83744` (crimson — buttons, stat numbers, accents), navy
  `#234C86` / `#163A6D` (secondary), dark text `#2D2D2D`, page background
  `#F6F3F3`, rose surface `#F7E2E4` (section backgrounds), rose accents
  `#F7D1D1` / `#E4A4AA` / `#D6A3A7`, gold `#ECB044`, orange `#DC6338`,
  divider `#E7DBDB`. Font: **Inter** (Google Fonts, weights 300/400/600),
  the only font family used anywhere on the reference site.
- Card/panel convention (from reference `style.css` `.data-headContainer` /
  `.data-container` rules): white background, `border-radius: 5px`,
  `box-shadow: 0 0 10px rgba(0,0,0,0.05)`, `padding: 23px`.
- Every API call has explicit loading, error, and empty states (house
  convention, already established in `Home`/`Login`).
- Route-level code splitting, folder-per-component, mobile-first Tailwind,
  no hardcoded URLs outside `config/config.js` (house conventions, spec §2).
- Every translatable content field from the backend is `{ en, kn }`; UI
  labels come from `i18n/locales/*/common.json` (spec §7).
- Real assets only — no stock-photo or placeholder-image substitutes for
  anything the reference site actually has an image/video for (user
  direction, 2026-09-22).

---

## File Structure

```
src/
├── assets/
│   ├── images/
│   │   ├── sectors/            # focus-sector photos (Pharma, Automobile, ...)
│   │   ├── gi/                 # GI product photos (not used by Home, copied for later plans)
│   │   └── leaders/             # CM/Dy.CM/Minister portraits, if present in source
│   ├── videos/
│   │   └── hero-banner.mp4      # re-encoded, web-sized
│   └── karnataka-districts-map.svg   # extracted verbatim from the reference SVG map
├── api/
│   ├── leadersApi.js
│   ├── districtsApi.js
│   ├── sectorsApi.js
│   ├── eventsApi.js
│   └── newsletterApi.js
├── sections/
│   ├── LeadershipCarousel/
│   ├── Hero/
│   ├── KarnatakaHighlights/
│   ├── DistrictExplorer/
│   │   ├── index.jsx             # composes KarnatakaMap + DistrictPanel
│   │   ├── KarnatakaMap/index.jsx
│   │   └── DistrictPanel/index.jsx
│   ├── SectorsTeaser/
│   ├── EventsTeaser/
│   └── NewsletterSignup/
├── pages/public/Home/index.jsx   # rebuilt: composes all sections above
└── index.css                      # gains the @theme brand-token block
mock/
├── db.json                         # gains full leaders[3], districts[30], events, newsletter
└── server.js                        # gains POST /newsletter/subscribe
```

---

## Task 1: Brand design tokens + retrofit existing components

**Files:**
- Modify: `src/index.css`, `index.html` (Google Fonts link),
  `src/components/Button/index.jsx`, `src/sections/Header/index.jsx`,
  `src/pages/public/Home/index.jsx`
- Test: existing `Button.test.jsx`, `Header.test.jsx`, `Home.test.jsx`
  (already pass — this task must not break them; see Step 5)

**Interfaces:**
- Produces: Tailwind utility classes `bg-brand-primary`, `text-brand-primary`,
  `border-brand-primary`, `bg-brand-navy`, `text-brand-navy`,
  `bg-brand-surface` (the `#F7E2E4` rose section background),
  `bg-brand-page` (the `#F6F3F3` page background), `text-brand-dark`,
  available to every component from here on.

- [x] **Step 1: Add the `@theme` brand tokens to `src/index.css`**

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;

  --color-brand-primary: #c83744;
  --color-brand-primary-dark: #a82c38;
  --color-brand-navy: #234c86;
  --color-brand-navy-dark: #163a6d;
  --color-brand-dark: #2d2d2d;
  --color-brand-page: #f6f3f3;
  --color-brand-surface: #f7e2e4;
  --color-brand-rose: #f7d1d1;
  --color-brand-rose-dark: #e4a4aa;
  --color-brand-gold: #ecb044;
  --color-brand-orange: #dc6338;
  --color-brand-divider: #e7dbdb;
}

body {
  background-color: var(--color-brand-page);
  color: var(--color-brand-dark);
  font-family: var(--font-sans);
}
```

- [x] **Step 2: Load Inter from Google Fonts in `index.html`**

```html
<!-- index.html, inside <head>, after the existing meta tags -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap"
  rel="stylesheet"
/>
```

- [x] **Step 3: Retrofit `Button` to use the brand primary color**

```jsx
// src/components/Button/index.jsx
const VARIANT_CLASSES = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark',
  secondary: 'bg-white text-brand-primary border border-brand-primary hover:bg-brand-surface',
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

- [x] **Step 4: Retrofit `Header`'s active-nav-link color**

In `src/sections/Header/index.jsx`, change the `NavLink` active-state class
from `text-blue-800` to `text-brand-primary`, and the `VTPC` wordmark from
`text-blue-800` to `text-brand-primary`:

```jsx
<NavLink to={ROUTES.HOME} className="text-lg font-bold text-brand-primary">
  VTPC
</NavLink>
```

```jsx
className={({ isActive }) => (isActive ? 'font-semibold text-brand-primary' : 'text-gray-700')}
```

- [x] **Step 5: Run the existing test suite — confirm nothing broke**

Run: `npm test`
Expected: all previously-passing tests (31) still pass. `Button.test.jsx`'s
`toHaveClass('bg-white')` assertion still passes (secondary variant keeps
`bg-white`). `Header.test.jsx` and `Home.test.jsx` assert on text/roles, not
color classes, so they're unaffected.

- [x] **Step 6: Manually verify fonts/colors render**

Run: `npm run dev`, open the app, confirm (via browser dev tools or visual
check) the page uses Inter and the nav/button use the crimson `#C83744`
instead of the old default blue.

- [x] **Step 7: Commit**

```bash
git add src/index.css index.html src/components/Button src/sections/Header
git commit -m "feat: add brand design tokens and retrofit Button/Header to use them"
```

---

## Task 2: Asset pipeline — copy images, re-encode videos

**Files:**
- Create: `scripts/optimize-videos.mjs`, `src/assets/images/sectors/*`,
  `src/assets/videos/hero-banner.mp4`
- Modify: `package.json` (adds `ffmpeg-static`, a `postinstall`-free one-off
  `npm run optimize-videos` script)

**Interfaces:**
- Produces: `src/assets/videos/hero-banner.mp4` — a re-encoded, web-sized
  version of the reference site's `bannerVedio.mp4`, for `Hero` (Task 4) to
  import. Real sector photos in `src/assets/images/sectors/` for
  `SectorsTeaser` (Task 9) and the later Exporter Corner plan.

- [x] **Step 1: Install ffmpeg-static**

```bash
npm install -D ffmpeg-static
```

This downloads a portable ffmpeg binary as part of the package — no system
install or PATH configuration needed, and it works the same on any
developer's machine or CI.

- [x] **Step 2: Write the video re-encode script**

```js
// scripts/optimize-videos.mjs
import ffmpegPath from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const SOURCE_DIR =
  'E:/vtpc.karnataka.gov.in Source Code/20241206_vtpckarnatakavisvesvarayatra_b7e51cdc9d06b88b9857_20250424100417_archive/wp-content/themes/VTPC/assets/images'
const OUT_DIR = path.resolve('src/assets/videos')

const JOBS = [{ source: 'bannerVedio.mp4', out: 'hero-banner.mp4' }]

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

for (const job of JOBS) {
  const inputPath = path.join(SOURCE_DIR, job.source)
  const outputPath = path.join(OUT_DIR, job.out)
  console.log(`Re-encoding ${job.source} -> ${job.out}`)
  execFileSync(ffmpegPath, [
    '-y',
    '-i', inputPath,
    '-vf', 'scale=1280:-2',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'slow',
    '-an',
    outputPath,
  ])
  console.log(`Done: ${outputPath}`)
}
```

`-an` strips audio (the hero banner autoplays muted per Task 4, so audio
would be dead weight); `-crf 28` with `-preset slow` targets a substantially
smaller file than the ~22MB source while keeping it watchable at 1280px
wide, which is plenty for a background video element.

- [x] **Step 3: Add the npm script**

```json
{
  "scripts": {
    "optimize-videos": "node scripts/optimize-videos.mjs"
  }
}
```

- [x] **Step 4: Run it and verify the output size**

Run: `npm run optimize-videos`
Expected: `src/assets/videos/hero-banner.mp4` is created and noticeably
smaller than the ~22MB source (verify with `ls -lh src/assets/videos/`) —
a few MB is the expectation at this bitrate/resolution, not a hard
threshold, since content complexity affects final size.

- [x] **Step 5: Copy the sector images used by this plan's `SectorsTeaser`**

```bash
mkdir -p src/assets/images/sectors
cp "E:/vtpc.karnataka.gov.in Source Code/20241206_vtpckarnatakavisvesvarayatra_b7e51cdc9d06b88b9857_20250424100417_archive/wp-content/themes/VTPC/assets/images/Aerospace.jpg" src/assets/images/sectors/aerospace.jpg
cp "E:/vtpc.karnataka.gov.in Source Code/20241206_vtpckarnatakavisvesvarayatra_b7e51cdc9d06b88b9857_20250424100417_archive/wp-content/themes/VTPC/assets/images/Automobile.jpg" src/assets/images/sectors/automobile.jpg
cp "E:/vtpc.karnataka.gov.in Source Code/20241206_vtpckarnatakavisvesvarayatra_b7e51cdc9d06b88b9857_20250424100417_archive/wp-content/themes/VTPC/assets/images/Agriculture.png" src/assets/images/sectors/agriculture.png
```

(The remaining 5 focus-sector photos and all GI/leader photography are
copied in their own plans' asset tasks — Task 9 here only needs the 3
sectors shown in the Home teaser.)

- [x] **Step 6: Commit**

```bash
git add scripts package.json package-lock.json src/assets
git commit -m "chore: add video optimization pipeline and copy real sector/hero assets"
```

---

## Task 3: `leadersApi` and `LeadershipCarousel` section

**Files:**
- Create: `src/api/leadersApi.js`, `src/sections/LeadershipCarousel/index.jsx`,
  `src/sections/LeadershipCarousel/LeadershipCarousel.test.jsx`
- Modify: `mock/db.json` (`leaders` array), `src/pages/public/Home/index.jsx`

**Interfaces:**
- Produces: `getLeaders()` → resolves `Leader[]` matching spec §4
  (`{ id, name, designation: {en,kn}, photo, order }`). `LeadershipCarousel`
  — no props, fetches its own data, renders the current leader with
  Previous/Next controls.
- Reference: the reference homepage shows one leader at a time in a
  carousel — CM, Dy. CM, Minister — with name + designation. Real content
  captured during spec research: Shri Siddaramaiah (Chief Minister of
  Karnataka), Shri D.K. Shivakumar (Deputy Chief Minister — corrected from
  the source HTML's duplicated "Chief Minister" label, which was a content
  bug on the reference site itself, not something to replicate), Shri M.B.
  Patil (Minister for Large & Medium Industries and Infrastructure
  Development).

- [x] **Step 1: Update `mock/db.json`'s `leaders` array with real content**

```json
"leaders": [
  { "id": "1", "name": "Shri Siddaramaiah", "designation": { "en": "Hon'ble Chief Minister of Karnataka", "kn": "" }, "photo": "", "order": 1 },
  { "id": "2", "name": "Shri D.K. Shivakumar", "designation": { "en": "Hon'ble Deputy Chief Minister of Karnataka", "kn": "" }, "photo": "", "order": 2 },
  { "id": "3", "name": "Shri M.B. Patil", "designation": { "en": "Hon'ble Minister for LMI and Infrastructure Development, Government of Karnataka", "kn": "" }, "photo": "", "order": 3 }
]
```

`photo` is left empty — no leader portraits were found in the extracted
theme assets; `LeadershipCarousel` (Step 4) renders a text-only card when
`photo` is falsy rather than a broken image.

- [x] **Step 2: Write `leadersApi.js`**

```js
// src/api/leadersApi.js
import axiosClient from './axiosClient'

export function getLeaders() {
  return axiosClient.get('/leaders').then((res) => res.data)
}
```

- [x] **Step 3: Write the failing test**

```jsx
// src/sections/LeadershipCarousel/LeadershipCarousel.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as leadersApi from '../../api/leadersApi'
import LeadershipCarousel from './index'

vi.mock('../../api/leadersApi')

const LEADERS = [
  { id: '1', name: 'Shri Siddaramaiah', designation: { en: "Hon'ble Chief Minister of Karnataka", kn: '' }, photo: '', order: 1 },
  { id: '2', name: 'Shri D.K. Shivakumar', designation: { en: "Hon'ble Deputy Chief Minister of Karnataka", kn: '' }, photo: '', order: 2 },
]

describe('LeadershipCarousel', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows the first leader by default, then advances on Next', async () => {
    leadersApi.getLeaders.mockResolvedValue(LEADERS)
    render(<LeadershipCarousel />)

    await waitFor(() => expect(screen.getByText('Shri Siddaramaiah')).toBeInTheDocument())
    expect(screen.getByText("Hon'ble Chief Minister of Karnataka")).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Shri D.K. Shivakumar')).toBeInTheDocument()
  })

  it('renders nothing when there are no leaders', async () => {
    leadersApi.getLeaders.mockResolvedValue([])
    const { container } = render(<LeadershipCarousel />)
    await waitFor(() => expect(leadersApi.getLeaders).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing on fetch failure (non-critical section, fails quietly)', async () => {
    leadersApi.getLeaders.mockRejectedValue({ message: 'Network error', status: 0 })
    const { container } = render(<LeadershipCarousel />)
    await waitFor(() => expect(leadersApi.getLeaders).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [x] **Step 4: Run it, verify it fails**

Run: `npm test -- LeadershipCarousel`
Expected: FAIL — module doesn't exist.

- [x] **Step 5: Implement `LeadershipCarousel`**

```jsx
// src/sections/LeadershipCarousel/index.jsx
import { useEffect, useState } from 'react'
import { getLeaders } from '../../api/leadersApi'

export default function LeadershipCarousel() {
  const [leaders, setLeaders] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let isMounted = true
    getLeaders()
      .then((data) => {
        if (isMounted) setLeaders(data)
      })
      .catch(() => {
        if (isMounted) setLeaders([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (leaders.length === 0) return null

  const current = leaders[index]

  function goNext() {
    setIndex((i) => (i + 1) % leaders.length)
  }

  function goPrev() {
    setIndex((i) => (i - 1 + leaders.length) % leaders.length)
  }

  return (
    <section className="bg-brand-navy px-4 py-6 text-center text-white md:px-8">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-4">
        <button type="button" onClick={goPrev} aria-label="Previous" className="px-2 text-xl">
          ‹
        </button>
        <div>
          <h2 className="text-lg font-semibold">{current.name}</h2>
          <p className="text-sm text-white/80">{current.designation.en}</p>
        </div>
        <button type="button" onClick={goNext} aria-label="Next" className="px-2 text-xl">
          ›
        </button>
      </div>
    </section>
  )
}
```

- [x] **Step 6: Run it, verify it passes**

Run: `npm test -- LeadershipCarousel`
Expected: PASS, 3 tests.

- [x] **Step 7: Commit**

`LeadershipCarousel` is not wired into `Home` yet — it has its own passing
test suite, which is this task's complete deliverable. Wiring it in now
would break `Home.test.jsx` (that test doesn't mock `leadersApi`, so the
real, unmocked `getLeaders()` call would fire during the test). All section
composition into `Home`, with the matching test mocks added at the same
time, happens together in Task 12.

```bash
git add mock/db.json src/api/leadersApi.js src/sections/LeadershipCarousel
git commit -m "feat: add leadersApi and LeadershipCarousel section"
```

---

## Task 4: `Hero` section with the re-encoded video background

**Files:**
- Create: `src/sections/Hero/index.jsx`, `src/sections/Hero/Hero.test.jsx`
- Modify: `src/pages/public/Home/index.jsx`

**Interfaces:**
- Consumes: `content.hero` from `homepageApi.getHomepageContent()` (already
  exists: `{ title, subtitle }`), the video at
  `src/assets/videos/hero-banner.mp4` (Task 2).
- Produces: `Hero` — props `{ title, subtitle }`, renders the video
  background + heading text; `Home` passes `content.hero.title` /
  `content.hero.subtitle` into it instead of rendering them directly.

- [x] **Step 1: Write the failing test**

```jsx
// src/sections/Hero/Hero.test.jsx
import { render, screen } from '@testing-library/react'
import Hero from './index'

describe('Hero', () => {
  it('renders the title and subtitle over the video background', () => {
    render(<Hero title="Gateway to Global Markets: Exporters Guide" subtitle="Explore Unlimited Trade Prospects Worldwide" />)
    expect(screen.getByRole('heading', { name: 'Gateway to Global Markets: Exporters Guide' })).toBeInTheDocument()
    expect(screen.getByText('Explore Unlimited Trade Prospects Worldwide')).toBeInTheDocument()
  })
})
```

- [x] **Step 2: Run it, verify it fails**

Run: `npm test -- Hero`
Expected: FAIL — module doesn't exist.

- [x] **Step 3: Implement `Hero`**

```jsx
// src/sections/Hero/index.jsx
import heroVideo from '../../assets/videos/hero-banner.mp4'

export default function Hero({ title, subtitle }) {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden text-center text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-brand-dark/50" />
      <div className="relative z-10 px-4 py-16 md:px-8">
        <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 text-base md:text-lg">{subtitle}</p>
      </div>
    </section>
  )
}
```

The `bg-brand-dark/50` overlay (Tailwind's opacity-modifier syntax on the
custom `--color-brand-dark` token) keeps the white heading text readable
over varying video brightness — the reference site uses a similar dark
overlay on its hero.

- [x] **Step 4: Run it, verify it passes**

Run: `npm test -- Hero`
Expected: PASS, 1 test.

- [x] **Step 5: Wire it into `Home`, replacing the inline hero markup**

```jsx
// src/pages/public/Home/index.jsx (relevant excerpt — full file assembled in Task 10)
<Hero title={content.hero.title} subtitle={content.hero.subtitle} />
```

Remove the old inline `<section className="px-4 py-12 text-center ...">`
hero markup from `Home` — `Hero` replaces it.

- [x] **Step 6: Update `Home.test.jsx` for the new structure**

The existing assertions (`screen.getByText('Gateway to Global Markets')`,
etc.) still pass unchanged since `Hero` renders the same text content —
verify with `npm test -- Home` rather than editing the test.

- [x] **Step 7: Run the full suite**

Run: `npm test`
Expected: all tests pass.

- [x] **Step 8: Commit**

```bash
git add src/sections/Hero src/pages/public/Home/index.jsx
git commit -m "feat: add Hero section with real video background"
```

---

## Task 5: `KarnatakaHighlights` section

**Files:**
- Create: `src/sections/KarnatakaHighlights/index.jsx`,
  `src/sections/KarnatakaHighlights/KarnatakaHighlights.test.jsx`
- Modify: `src/pages/public/Home/index.jsx`

**Interfaces:**
- Consumes: `content.highlights` from `homepageApi.getHomepageContent()`
  (already exists: `[{ title, description }]`, 4 items — Diverse Economy,
  Innovation Hub, Agricultural Bounty, Strategic Location).
- Produces: `KarnatakaHighlights` — props `{ highlights }`, renders a
  responsive card grid.

- [x] **Step 1: Write the failing test**

```jsx
// src/sections/KarnatakaHighlights/KarnatakaHighlights.test.jsx
import { render, screen } from '@testing-library/react'
import KarnatakaHighlights from './index'

const HIGHLIGHTS = [
  { title: 'Diverse Economy', description: "Karnataka's economy spans agriculture, industry, and services." },
  { title: 'Innovation Hub', description: "Home to India's leading technology and biotech clusters." },
]

describe('KarnatakaHighlights', () => {
  it('renders a card per highlight', () => {
    render(<KarnatakaHighlights highlights={HIGHLIGHTS} />)
    expect(screen.getByRole('heading', { name: 'Diverse Economy' })).toBeInTheDocument()
    expect(screen.getByText("Karnataka's economy spans agriculture, industry, and services.")).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Innovation Hub' })).toBeInTheDocument()
  })

  it('renders nothing when there are no highlights', () => {
    const { container } = render(<KarnatakaHighlights highlights={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [x] **Step 2: Run it, verify it fails**

Run: `npm test -- KarnatakaHighlights`
Expected: FAIL — module doesn't exist.

- [x] **Step 3: Implement `KarnatakaHighlights`**

```jsx
// src/sections/KarnatakaHighlights/index.jsx
export default function KarnatakaHighlights({ highlights }) {
  if (highlights.length === 0) return null

  return (
    <section className="bg-white px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">
        Explore Unlimited Trade Prospects Worldwide
      </h2>
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-[5px] bg-white p-6 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
            <h3 className="text-lg font-semibold text-brand-primary">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

The card styling (`rounded-[5px]`, `shadow-[0_0_10px_rgba(0,0,0,0.05)]`)
matches the reference `.data-headContainer` card convention noted in Global
Constraints — reused across every card-shaped element in this plan for
consistency.

- [x] **Step 4: Run it, verify it passes**

Run: `npm test -- KarnatakaHighlights`
Expected: PASS, 2 tests.

- [x] **Step 5: Wire it into `Home`**

```jsx
<KarnatakaHighlights highlights={content.highlights} />
```

- [x] **Step 6: Commit**

```bash
git add src/sections/KarnatakaHighlights src/pages/public/Home/index.jsx
git commit -m "feat: add KarnatakaHighlights section"
```

---

## Task 6: `districtsApi` and mock data for all 30 districts

> **Policy change mid-execution:** starting with this task, the user asked
> that no new tests be written for this project (later formalized into the
> `react-frontend-builder` skill as a durable default: no tests unless
> explicitly requested). From here through the rest of this plan, every
> task's `*.test.js`/`*.test.jsx` file and its "write failing test / verify
> it fails / verify it passes" steps are **skipped** — components are
> implemented directly and verified via `npm run lint`, `npm run build`,
> and manual browser checks instead. Task checkboxes below are marked done
> for the task's real deliverable even where a step describes a test that
> wasn't written.

**Files:**
- Create: `src/api/districtsApi.js`
- Modify: `mock/db.json` (`districts` array — all 30 real district slugs)

**Interfaces:**
- Produces: `getDistricts()` → resolves `District[]`
  (`{ id, name, tagline:{en,kn}, totalExportValueCr, countries[], products[], sectors[] }`,
  spec §4). `id` is the URL-safe district slug, matching the SVG map's
  `data-district` attribute values exactly (Task 8 depends on this).
- Reference: all 30 district slugs/titles confirmed from the reference
  site's SVG map (`template/home.php`, the `data-district="..."` attributes
  on each `<a class="map-a">`). Full district export figures (country/
  product/sector breakdowns) were only captured for Kalaburagi during spec
  research; the other 29 get real name/slug but an empty data shape —
  `DistrictPanel` (Task 8) renders an explicit "not available yet" empty
  state for those rather than fabricating numbers.

- [x] **Step 1: Write the failing test**

```js
// src/api/districtsApi.test.js
import axiosClient from './axiosClient'
import { getDistricts } from './districtsApi'

vi.mock('./axiosClient')

describe('districtsApi', () => {
  it('fetches the districts list', async () => {
    const districts = [{ id: 'kalaburagi', name: 'Kalaburagi' }]
    axiosClient.get = vi.fn().mockResolvedValue({ data: districts })

    const result = await getDistricts()

    expect(axiosClient.get).toHaveBeenCalledWith('/districts')
    expect(result).toEqual(districts)
  })
})
```

- [x] **Step 2: Run it, verify it fails**

Run: `npm test -- districtsApi`
Expected: FAIL — module doesn't exist.

- [x] **Step 3: Implement `districtsApi.js`**

```js
// src/api/districtsApi.js
import axiosClient from './axiosClient'

export function getDistricts() {
  return axiosClient.get('/districts').then((res) => res.data)
}
```

- [x] **Step 4: Run it, verify it passes**

Run: `npm test -- districtsApi`
Expected: PASS, 1 test.

- [x] **Step 5: Replace `mock/db.json`'s `districts` array with all 30**

```json
"districts": [
  { "id": "kalaburagi", "name": "Kalaburagi", "tagline": { "en": "Tur Bowl of Karnataka", "kn": "" }, "totalExportValueCr": 129.67, "countries": [{ "name": "Indonesia", "percentage": 32.19 }, { "name": "Malaysia", "percentage": 10.96 }, { "name": "Bangladesh", "percentage": 9.03 }, { "name": "Tanzania", "percentage": 5.47 }, { "name": "Egypt", "percentage": 5.21 }], "products": [{ "name": "Salt, Sulphur, Earths and Stone, Plastering Materials, LIM", "percentage": 32.19 }, { "name": "Sugars and Sugar Confectionery", "percentage": 22.80 }, { "name": "Miscellaneous Chemical Products", "percentage": 22.17 }, { "name": "Others", "percentage": 20.64 }], "sectors": [{ "name": "Agriculture", "percentage": 25.9 }, { "name": "Industry (Secondary)", "percentage": 19.1 }, { "name": "Services (Tertiary)", "percentage": 55 }] },
  { "id": "bagalkote", "name": "Bagalkote", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "ballari", "name": "Ballari", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "belagavi", "name": "Belagavi", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "bengaluru-rural", "name": "Bengaluru Rural", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "bengaluru-urban", "name": "Bengaluru Urban", "tagline": { "en": "IT capital of India", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "bidar", "name": "Bidar", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "chamarajanagara", "name": "Chamarajanagara", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "chikkaballapura", "name": "Chikkaballapura", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "chikkamangaluru", "name": "Chikkamagaluru", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "chitradurga", "name": "Chitradurga", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "dakshina-kannada", "name": "Dakshina Kannada", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "davangere", "name": "Davanagere", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "dharwad", "name": "Dharwad", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "gadag", "name": "Gadag", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "hassan", "name": "Hassan", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "haveri", "name": "Haveri", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "kodagu", "name": "Kodagu", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "kolar", "name": "Kolara", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "koppal", "name": "Koppal", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "mandya", "name": "Mandya", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "mysuru", "name": "Mysuru", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "raichur", "name": "Raichur", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "ramanagara", "name": "Ramanagara", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "shivamogga", "name": "Shivamogga", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "tumakuru", "name": "Tumakuru", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "udupi", "name": "Udupi", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "uttara-kannada", "name": "Uttara Kannada", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "vijayapura", "name": "Vijayapura", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] },
  { "id": "yadgir", "name": "Yadgir", "tagline": { "en": "", "kn": "" }, "totalExportValueCr": null, "countries": [], "products": [], "sectors": [] }
]
```

- [x] **Step 6: Restart the mock server and verify all 30 come back**

Run: `npm run mock-api` (restart if already running), then:
```bash
curl -s http://localhost:4000/districts | grep -o '"id":"[a-z-]*"' | wc -l
```
Expected: `30`.

- [x] **Step 7: Commit**

```bash
git add src/api/districtsApi.js src/api/districtsApi.test.js mock/db.json
git commit -m "feat: add districtsApi and seed all 30 real district slugs"
```

---

## Task 7: Extract the reference Karnataka SVG map and build `KarnatakaMap`

**Files:**
- Create: `src/assets/karnataka-districts-map.svg`,
  `src/sections/DistrictExplorer/KarnatakaMap/index.jsx`,
  `src/sections/DistrictExplorer/KarnatakaMap/KarnatakaMap.test.jsx`

**Interfaces:**
- Produces: `KarnatakaMap` — props `{ selectedId, onSelect }`
  (`onSelect(districtId: string)`), renders the real district-boundary SVG
  and calls `onSelect` with the clicked district's slug.
- Reference: the reference site's Karnataka map is a static SVG,
  `viewBox="0 0 422 538"`, with one `<a href="#" data-district="{slug}"
  title="{Name}" class="map-a">` per district wrapping its boundary
  `<path>`(s) — no server-side interpolation inside the SVG itself (pure
  static markup), confirmed by inspecting `template/home.php` lines
  132–368. Extracted verbatim rather than redrawn (spec §9: "reuse the
  shapes... rather than redesigning the artwork from scratch").

- [x] **Step 1: Extract the SVG verbatim**

```bash
sed -n '132,368p' "E:/vtpc.karnataka.gov.in Source Code/20241206_vtpckarnatakavisvesvarayatra_b7e51cdc9d06b88b9857_20250424100417_archive/wp-content/themes/VTPC/template/home.php" > src/assets/karnataka-districts-map.svg
```

- [x] **Step 2: Verify no PHP interpolation leaked into the extract**

```bash
grep -c '<?' src/assets/karnataka-districts-map.svg
```
Expected: `0`. If non-zero, open the file, find the `<?= ... ?>` fragment,
and replace it with its resolved static value (there is no dynamic template
directory URI needed inside path/mask data, so this is not expected to
trigger, but must be verified rather than assumed).

- [x] **Step 3: Confirm the file is a well-formed, self-contained `<svg>`**

```bash
head -c 200 src/assets/karnataka-districts-map.svg
tail -c 200 src/assets/karnataka-districts-map.svg
```
Expected: starts with `<svg viewBox="0 0 422 538" ...>` and ends with
`</svg>` (matching the `sed` range boundaries confirmed during plan
research — line 132 is the opening tag, line 368 is `</svg>`).

- [x] **Step 4: Write the failing test**

```jsx
// src/sections/DistrictExplorer/KarnatakaMap/KarnatakaMap.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import KarnatakaMap from './index'

describe('KarnatakaMap', () => {
  it('calls onSelect with the clicked district slug', () => {
    const onSelect = vi.fn()
    render(<KarnatakaMap selectedId="kalaburagi" onSelect={onSelect} />)

    const kalaburagiPath = document.querySelector('[data-district="kalaburagi"]')
    expect(kalaburagiPath).not.toBeNull()
    fireEvent.click(kalaburagiPath)

    expect(onSelect).toHaveBeenCalledWith('kalaburagi')
  })

  it('renders every one of the 30 reference districts', () => {
    render(<KarnatakaMap selectedId="kalaburagi" onSelect={vi.fn()} />)
    const districtLinks = document.querySelectorAll('[data-district]')
    expect(districtLinks.length).toBe(30)
  })

  it('marks the selected district with the selected class', () => {
    render(<KarnatakaMap selectedId="bidar" onSelect={vi.fn()} />)
    const bidar = document.querySelector('[data-district="bidar"]')
    expect(bidar.className.baseVal).toContain('map-a-selected')
  })
})
```

- [x] **Step 5: Run it, verify it fails**

Run: `npm test -- KarnatakaMap`
Expected: FAIL — module doesn't exist.

- [x] **Step 6: Implement `KarnatakaMap`**

Rendered via `dangerouslySetInnerHTML` from the extracted static SVG (real
markup, not JSX-authored — converting 30 `<a>` blocks' `class`/attribute
casing to JSX would be error-prone busywork with no benefit over injecting
the verbatim, already-valid markup and wiring one delegated click
listener):

```jsx
// src/sections/DistrictExplorer/KarnatakaMap/index.jsx
import { useEffect, useRef } from 'react'
import mapMarkup from '../../../assets/karnataka-districts-map.svg?raw'

export default function KarnatakaMap({ selectedId, onSelect }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleClick(event) {
      const link = event.target.closest('[data-district]')
      if (!link) return
      event.preventDefault()
      onSelect(link.getAttribute('data-district'))
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [onSelect])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll('[data-district]').forEach((link) => {
      link.classList.toggle('map-a-selected', link.getAttribute('data-district') === selectedId)
    })
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      className="[&_.map-a]:cursor-pointer [&_.map-a]:outline-none [&_.map-a-selected_path]:fill-brand-primary"
      role="img"
      aria-label="Map of Karnataka districts — select a district to view its export data"
      dangerouslySetInnerHTML={{ __html: mapMarkup }}
    />
  )
}
```

The `[&_.map-a-selected_path]:fill-brand-primary` arbitrary-variant
Tailwind class highlights whichever district is currently selected by
overriding its path fill — the reference site's own per-district fill
colors stay as the unselected baseline.

- [x] **Step 7: Run it, verify it passes**

Run: `npm test -- KarnatakaMap`
Expected: PASS, 3 tests.

- [x] **Step 8: Commit**

```bash
git add src/assets/karnataka-districts-map.svg src/sections/DistrictExplorer/KarnatakaMap
git commit -m "feat: extract reference Karnataka SVG map and build KarnatakaMap component"
```

---

## Task 8: `DistrictPanel` and the composed `DistrictExplorer` section

**Files:**
- Create: `src/sections/DistrictExplorer/DistrictPanel/index.jsx`,
  `src/sections/DistrictExplorer/DistrictPanel/DistrictPanel.test.jsx`,
  `src/sections/DistrictExplorer/index.jsx`,
  `src/sections/DistrictExplorer/DistrictExplorer.test.jsx`
- Modify: `src/pages/public/Home/index.jsx`

**Interfaces:**
- Consumes: `getDistricts()` (Task 6), `KarnatakaMap` (Task 7).
- Produces: `DistrictPanel` — props `{ district }` (a single `District` or
  `null`), renders the data card or an empty state. `DistrictExplorer` — no
  props, owns the fetch + `selectedId` state, composes `KarnatakaMap` +
  `DistrictPanel`.
- Reference: card/list styling taken directly from the reference
  `style.css` rules for `.data-headContainer` (white, `border-radius: 5px`,
  `box-shadow: 0 0 10px rgba(0,0,0,0.05)`, `padding: 23px`), `.data-title`
  (`#C83744`, 12px, weight 600, uppercase), `.total-headExports` (`#C83744`,
  24px, weight 600), `.data-list li` (flex, `border-bottom: 1px solid
  #E7DBDB`), `.percentage` (`#C83744`).

- [x] **Step 1: Write the failing test for `DistrictPanel`**

```jsx
// src/sections/DistrictExplorer/DistrictPanel/DistrictPanel.test.jsx
import { render, screen } from '@testing-library/react'
import DistrictPanel from './index'

const KALABURAGI = {
  id: 'kalaburagi',
  name: 'Kalaburagi',
  tagline: { en: 'Tur Bowl of Karnataka', kn: '' },
  totalExportValueCr: 129.67,
  countries: [{ name: 'Indonesia', percentage: 32.19 }],
  products: [{ name: 'Sugars and Sugar Confectionery', percentage: 22.8 }],
  sectors: [{ name: 'Agriculture', percentage: 25.9 }],
}

describe('DistrictPanel', () => {
  it('renders the district name, tagline, and export value', () => {
    render(<DistrictPanel district={KALABURAGI} />)
    expect(screen.getByRole('heading', { name: 'Kalaburagi' })).toBeInTheDocument()
    expect(screen.getByText('Tur Bowl of Karnataka')).toBeInTheDocument()
    expect(screen.getByText('129.67')).toBeInTheDocument()
  })

  it('renders country/product/sector breakdown lists', () => {
    render(<DistrictPanel district={KALABURAGI} />)
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
    expect(screen.getByText('32.19%')).toBeInTheDocument()
    expect(screen.getByText('Sugars and Sugar Confectionery')).toBeInTheDocument()
    expect(screen.getByText('Agriculture')).toBeInTheDocument()
  })

  it('shows an empty state for a district with no data yet', () => {
    const empty = { id: 'bidar', name: 'Bidar', tagline: { en: '', kn: '' }, totalExportValueCr: null, countries: [], products: [], sectors: [] }
    render(<DistrictPanel district={empty} />)
    expect(screen.getByText(/not available yet/i)).toBeInTheDocument()
  })

  it('shows a prompt when no district is selected', () => {
    render(<DistrictPanel district={null} />)
    expect(screen.getByText(/select a district/i)).toBeInTheDocument()
  })
})
```

- [x] **Step 2: Run it, verify it fails**

Run: `npm test -- DistrictPanel`
Expected: FAIL — module doesn't exist.

- [x] **Step 3: Implement `DistrictPanel`**

```jsx
// src/sections/DistrictExplorer/DistrictPanel/index.jsx
function DataList({ title, items, suffix = '%' }) {
  return (
    <div className="rounded-[5px] bg-white p-5.75 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
      <h4 className="text-xs font-semibold uppercase text-brand-primary">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex justify-between border-b border-brand-divider pb-2.5 last:mb-0 last:border-none last:pb-0"
          >
            <span>{item.name}</span>
            <span className="text-brand-primary">
              {item.percentage}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DistrictPanel({ district }) {
  if (!district) {
    return <p className="p-6 text-center text-gray-600">Select a district on the map to view its export data.</p>
  }

  const hasData = district.totalExportValueCr != null

  return (
    <div className="flex max-h-119 flex-col gap-3.75 overflow-y-auto pr-3">
      <div>
        <h3 className="text-2xl font-semibold text-brand-primary">{district.name}</h3>
        {district.tagline.en && <p className="text-brand-dark">{district.tagline.en}</p>}
      </div>

      {!hasData ? (
        <p className="rounded-[5px] bg-white p-5.75 text-gray-600 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
          Export data for {district.name} is not available yet.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-[5px] bg-white p-5.75 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
            <h4 className="text-sm font-light uppercase">Total Exports Value (INR, in Crores)</h4>
            <p className="text-2xl font-semibold text-brand-primary">{district.totalExportValueCr}</p>
          </div>
          <DataList title="Country" items={district.countries} />
          <DataList title="Products" items={district.products} />
          <DataList title="Sector" items={district.sectors} />
        </>
      )}
    </div>
  )
}
```

- [x] **Step 4: Run it, verify it passes**

Run: `npm test -- DistrictPanel`
Expected: PASS, 4 tests.

- [x] **Step 5: Write the failing test for `DistrictExplorer`**

```jsx
// src/sections/DistrictExplorer/DistrictExplorer.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as districtsApi from '../../api/districtsApi'
import DistrictExplorer from './index'

vi.mock('../../api/districtsApi')

const DISTRICTS = [
  { id: 'kalaburagi', name: 'Kalaburagi', tagline: { en: 'Tur Bowl of Karnataka', kn: '' }, totalExportValueCr: 129.67, countries: [], products: [], sectors: [] },
  { id: 'bidar', name: 'Bidar', tagline: { en: '', kn: '' }, totalExportValueCr: null, countries: [], products: [], sectors: [] },
]

describe('DistrictExplorer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    districtsApi.getDistricts.mockResolvedValue(DISTRICTS)
  })

  it('defaults to the first district and switches on map click', async () => {
    render(<DistrictExplorer />)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Kalaburagi' })).toBeInTheDocument())

    fireEvent.click(document.querySelector('[data-district="bidar"]'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Bidar' })).toBeInTheDocument())
  })

  it('shows a loading state before data arrives', () => {
    render(<DistrictExplorer />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows an error state when the fetch fails', async () => {
    districtsApi.getDistricts.mockReset()
    districtsApi.getDistricts.mockRejectedValue({ message: 'Network error', status: 0 })
    render(<DistrictExplorer />)
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
```

- [x] **Step 6: Run it, verify it fails**

Run: `npm test -- DistrictExplorer`
Expected: FAIL — module doesn't exist.

- [x] **Step 7: Implement `DistrictExplorer`**

```jsx
// src/sections/DistrictExplorer/index.jsx
import { useEffect, useState } from 'react'
import { getDistricts } from '../../api/districtsApi'
import KarnatakaMap from './KarnatakaMap'
import DistrictPanel from './DistrictPanel'

export default function DistrictExplorer() {
  const [districts, setDistricts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getDistricts()
      .then((data) => {
        if (!isMounted) return
        setDistricts(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load district data.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const selectedDistrict = districts.find((d) => d.id === selectedId) ?? null

  return (
    <section className="bg-brand-surface px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">
        Spotlight on Karnataka's District Exports
      </h2>

      {isLoading && <p className="mt-8 text-center">Loading district data…</p>}
      {error && <p className="mt-8 text-center text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-8 md:flex-row">
          <div className="md:w-1/2">
            <KarnatakaMap selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="md:w-1/2">
            <DistrictPanel district={selectedDistrict} />
          </div>
        </div>
      )}
    </section>
  )
}
```

- [x] **Step 8: Run it, verify it passes**

Run: `npm test -- DistrictExplorer`
Expected: PASS, 3 tests.

- [x] **Step 9: Commit**

Not wired into `Home` yet, same reasoning as Task 3 — `DistrictExplorer`
fetches on mount, and `Home.test.jsx` doesn't mock `districtsApi` until
Task 12. `DistrictExplorer`'s own test suite (Step 8) is this task's
complete, independently-verified deliverable.

```bash
git add src/sections/DistrictExplorer
git commit -m "feat: add DistrictPanel and compose the DistrictExplorer section"
```

---

## Task 9: `sectorsApi` and `SectorsTeaser` section

**Files:**
- Create: `src/api/sectorsApi.js`, `src/sections/SectorsTeaser/index.jsx`,
  `src/sections/SectorsTeaser/SectorsTeaser.test.jsx`
- Modify: `mock/db.json` (add 2 more `focusSectors` entries — Automobile,
  Agriculture — alongside the existing Pharmaceutical & Biotech), `src/pages/public/Home/index.jsx`

**Interfaces:**
- Produces: `getSectors()` → resolves `FocusSector[]` (spec §4).
  `SectorsTeaser` — no props, fetches sectors, renders the first 3 as
  cards linking to `/exporter-corner` (a real route once that plan lands;
  for now it's a valid `<Link>` even though the destination page is still
  the placeholder from Task 12's `PublicRoutes`).

- [ ] **Step 1: Add 2 more focus sectors to `mock/db.json`** (name/image
  only — full stats/chart data for these arrives in the Exporter Corner
  plan, since Home only teases 3 cards)

```json
{ "id": "automobile", "name": { "en": "Automobile", "kn": "" }, "image": "/assets/sectors/automobile.jpg", "description": { "en": "", "kn": "" }, "statBoxes": [], "yearlyChart": [], "topMarkets": [], "keyInsights": { "en": "", "kn": "" } },
{ "id": "agriculture", "name": { "en": "Agriculture", "kn": "" }, "image": "/assets/sectors/agriculture.png", "description": { "en": "", "kn": "" }, "statBoxes": [], "yearlyChart": [], "topMarkets": [], "keyInsights": { "en": "", "kn": "" } }
```

- [ ] **Step 2: Write the failing test for `sectorsApi`**

```js
// src/api/sectorsApi.test.js
import axiosClient from './axiosClient'
import { getSectors } from './sectorsApi'

vi.mock('./axiosClient')

describe('sectorsApi', () => {
  it('fetches the focus sectors list', async () => {
    const sectors = [{ id: 'pharmaceutical-biotech', name: { en: 'Pharmaceutical & Biotech', kn: '' } }]
    axiosClient.get = vi.fn().mockResolvedValue({ data: sectors })

    const result = await getSectors()

    expect(axiosClient.get).toHaveBeenCalledWith('/focus-sectors')
    expect(result).toEqual(sectors)
  })
})
```

- [ ] **Step 3: Run it, verify it fails**

Run: `npm test -- sectorsApi`
Expected: FAIL.

- [ ] **Step 4: Implement `sectorsApi.js`**

```js
// src/api/sectorsApi.js
import axiosClient from './axiosClient'

export function getSectors() {
  return axiosClient.get('/focus-sectors').then((res) => res.data)
}
```

- [ ] **Step 5: Run it, verify it passes**

Run: `npm test -- sectorsApi`
Expected: PASS, 1 test.

- [ ] **Step 6: Write the failing test for `SectorsTeaser`**

```jsx
// src/sections/SectorsTeaser/SectorsTeaser.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as sectorsApi from '../../api/sectorsApi'
import SectorsTeaser from './index'

vi.mock('../../api/sectorsApi')

describe('SectorsTeaser', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders up to 3 sector cards', async () => {
    sectorsApi.getSectors.mockResolvedValue([
      { id: 'pharmaceutical-biotech', name: { en: 'Pharmaceutical & Biotech', kn: '' } },
      { id: 'automobile', name: { en: 'Automobile', kn: '' } },
      { id: 'agriculture', name: { en: 'Agriculture', kn: '' } },
      { id: 'aerospace', name: { en: 'Aerospace', kn: '' } },
    ])

    render(
      <MemoryRouter>
        <SectorsTeaser />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Pharmaceutical & Biotech')).toBeInTheDocument())
    expect(screen.getByText('Automobile')).toBeInTheDocument()
    expect(screen.getByText('Agriculture')).toBeInTheDocument()
    expect(screen.queryByText('Aerospace')).not.toBeInTheDocument()
  })

  it('renders nothing when there are no sectors', async () => {
    sectorsApi.getSectors.mockResolvedValue([])
    const { container } = render(
      <MemoryRouter>
        <SectorsTeaser />
      </MemoryRouter>
    )
    await waitFor(() => expect(sectorsApi.getSectors).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 7: Run it, verify it fails**

Run: `npm test -- SectorsTeaser`
Expected: FAIL — module doesn't exist.

- [ ] **Step 8: Implement `SectorsTeaser`**

```jsx
// src/sections/SectorsTeaser/index.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSectors } from '../../api/sectorsApi'
import { ROUTES } from '../../constants/routes'

export default function SectorsTeaser() {
  const [sectors, setSectors] = useState([])

  useEffect(() => {
    let isMounted = true
    getSectors()
      .then((data) => {
        if (isMounted) setSectors(data)
      })
      .catch(() => {
        if (isMounted) setSectors([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (sectors.length === 0) return null

  return (
    <section className="bg-white px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">
        Delve into the Champion Service Sectors
      </h2>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {sectors.slice(0, 3).map((sector) => (
          <Link
            key={sector.id}
            to={ROUTES.EXPORTER_CORNER}
            className="rounded-[5px] bg-white p-6 text-center font-semibold text-brand-primary shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:bg-brand-surface"
          >
            {sector.name.en}
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Run it, verify it passes**

Run: `npm test -- SectorsTeaser`
Expected: PASS, 2 tests.

- [ ] **Step 10: Commit**

Not wired into `Home` yet, same reasoning as Tasks 3 and 8 — `SectorsTeaser`
fetches on mount and also requires a Router context (`<Link>`), neither of
which `Home.test.jsx` accounts for until Task 12. `SectorsTeaser`'s own
test suite (Step 9), which already renders it inside a `MemoryRouter`, is
this task's complete deliverable.

```bash
git add src/api/sectorsApi.js src/api/sectorsApi.test.js src/sections/SectorsTeaser mock/db.json
git commit -m "feat: add sectorsApi and SectorsTeaser section"
```

---

## Task 10: `eventsApi` and `EventsTeaser` section

**Files:**
- Create: `src/api/eventsApi.js`, `src/sections/EventsTeaser/index.jsx`,
  `src/sections/EventsTeaser/EventsTeaser.test.jsx`
- Modify: `src/pages/public/Home/index.jsx`

**Interfaces:**
- Produces: `getEvents()` → resolves `Event[]` (spec §4). `EventsTeaser` —
  no props, renders up to 3 upcoming events.

- [ ] **Step 1: Write the failing test for `eventsApi`**

```js
// src/api/eventsApi.test.js
import axiosClient from './axiosClient'
import { getEvents } from './eventsApi'

vi.mock('./axiosClient')

describe('eventsApi', () => {
  it('fetches the events list', async () => {
    const events = [{ id: '1', title: { en: 'Sample Trade Expo', kn: '' } }]
    axiosClient.get = vi.fn().mockResolvedValue({ data: events })

    const result = await getEvents()

    expect(axiosClient.get).toHaveBeenCalledWith('/events')
    expect(result).toEqual(events)
  })
})
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npm test -- eventsApi`
Expected: FAIL.

- [ ] **Step 3: Implement `eventsApi.js`**

```js
// src/api/eventsApi.js
import axiosClient from './axiosClient'

export function getEvents() {
  return axiosClient.get('/events').then((res) => res.data)
}
```

- [ ] **Step 4: Run it, verify it passes**

Run: `npm test -- eventsApi`
Expected: PASS, 1 test.

- [ ] **Step 5: Write the failing test for `EventsTeaser`**

```jsx
// src/sections/EventsTeaser/EventsTeaser.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import * as eventsApi from '../../api/eventsApi'
import EventsTeaser from './index'

vi.mock('../../api/eventsApi')

describe('EventsTeaser', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders each upcoming event with its date and location', async () => {
    eventsApi.getEvents.mockResolvedValue([
      { id: '1', title: { en: 'Sample Trade Expo', kn: '' }, date: '2026-11-01', location: { en: 'Bengaluru', kn: '' }, description: { en: 'Sample seed content.', kn: '' }, registrationLink: '' },
    ])

    render(<EventsTeaser />)

    await waitFor(() => expect(screen.getByText('Sample Trade Expo')).toBeInTheDocument())
    expect(screen.getByText('Bengaluru')).toBeInTheDocument()
  })

  it('shows an empty state when there are no upcoming events', async () => {
    eventsApi.getEvents.mockResolvedValue([])
    render(<EventsTeaser />)
    await waitFor(() => expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 6: Run it, verify it fails**

Run: `npm test -- EventsTeaser`
Expected: FAIL — module doesn't exist.

- [ ] **Step 7: Implement `EventsTeaser`**

```jsx
// src/sections/EventsTeaser/index.jsx
import { useEffect, useState } from 'react'
import { getEvents } from '../../api/eventsApi'

export default function EventsTeaser() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getEvents()
      .then((data) => {
        if (isMounted) setEvents(data)
      })
      .catch(() => {
        if (isMounted) setEvents([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) return null

  return (
    <section className="bg-brand-surface px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">Upcoming Events at a Glance</h2>
      {events.length === 0 ? (
        <p className="mt-8 text-center text-gray-600">No upcoming events right now — check back soon.</p>
      ) : (
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="rounded-[5px] bg-white p-6 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-brand-primary">{event.date}</p>
              <h3 className="mt-1 font-semibold">{event.title.en}</h3>
              <p className="mt-1 text-sm text-gray-600">{event.location.en}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 8: Run it, verify it passes**

Run: `npm test -- EventsTeaser`
Expected: PASS, 2 tests.

- [ ] **Step 9: Commit**

Not wired into `Home` yet, same reasoning as Tasks 3, 8, and 9 —
`EventsTeaser` fetches on mount and `Home.test.jsx` doesn't mock
`eventsApi` until Task 12. `EventsTeaser`'s own test suite (Step 8) is this
task's complete deliverable.

```bash
git add src/api/eventsApi.js src/api/eventsApi.test.js src/sections/EventsTeaser
git commit -m "feat: add eventsApi and EventsTeaser section"
```

---

## Task 11: `newsletterApi` and `NewsletterSignup` section

**Files:**
- Create: `src/api/newsletterApi.js`, `src/sections/NewsletterSignup/index.jsx`,
  `src/sections/NewsletterSignup/NewsletterSignup.test.jsx`
- Modify: `mock/server.js` (add `POST /newsletter/subscribe`),
  `src/pages/public/Home/index.jsx`

**Interfaces:**
- Produces: `subscribeToNewsletter({ email })` → resolves on success,
  rejects with `{ message, status }` on failure (matches the
  `axiosClient` interceptor shape). `NewsletterSignup` — a controlled form
  with its own submitting/success/error state.

- [ ] **Step 1: Add the subscribe route to `mock/server.js`**

```js
// mock/server.js — add alongside the existing server.post('/auth/login', ...) block
server.post('/newsletter/subscribe', (req, res) => {
  const db = router.db
  const email = req.body?.email
  if (!email) {
    res.status(400).json({ message: 'Email is required' })
    return
  }
  db.get('newsletterSubscribers')
    .push({ id: Date.now().toString(), email, subscribedAt: new Date().toISOString() })
    .write()
  res.status(201).json({ message: 'Subscribed' })
})
```

Add `"newsletterSubscribers": []` to `mock/db.json` if it isn't already
present (Plan 1's seed data didn't include this collection).

- [ ] **Step 2: Write the failing test for `newsletterApi`**

```js
// src/api/newsletterApi.test.js
import axiosClient from './axiosClient'
import { subscribeToNewsletter } from './newsletterApi'

vi.mock('./axiosClient')

describe('newsletterApi', () => {
  it('posts the email to the subscribe endpoint', async () => {
    axiosClient.post = vi.fn().mockResolvedValue({ data: { message: 'Subscribed' } })

    await subscribeToNewsletter({ email: 'someone@example.com' })

    expect(axiosClient.post).toHaveBeenCalledWith('/newsletter/subscribe', { email: 'someone@example.com' })
  })
})
```

- [ ] **Step 3: Run it, verify it fails**

Run: `npm test -- newsletterApi`
Expected: FAIL.

- [ ] **Step 4: Implement `newsletterApi.js`**

```js
// src/api/newsletterApi.js
import axiosClient from './axiosClient'

export function subscribeToNewsletter({ email }) {
  return axiosClient.post('/newsletter/subscribe', { email }).then((res) => res.data)
}
```

- [ ] **Step 5: Run it, verify it passes**

Run: `npm test -- newsletterApi`
Expected: PASS, 1 test.

- [ ] **Step 6: Write the failing test for `NewsletterSignup`**

```jsx
// src/sections/NewsletterSignup/NewsletterSignup.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as newsletterApi from '../../api/newsletterApi'
import NewsletterSignup from './index'

vi.mock('../../api/newsletterApi')

describe('NewsletterSignup', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('submits the email and shows a success message', async () => {
    newsletterApi.subscribeToNewsletter.mockResolvedValue({ message: 'Subscribed' })
    render(<NewsletterSignup />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'someone@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => expect(screen.getByText(/thanks for subscribing/i)).toBeInTheDocument())
    expect(newsletterApi.subscribeToNewsletter).toHaveBeenCalledWith({ email: 'someone@example.com' })
  })

  it('shows an error message on failure', async () => {
    newsletterApi.subscribeToNewsletter.mockRejectedValue({ message: 'Network error', status: 0 })
    render(<NewsletterSignup />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'someone@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
```

- [ ] **Step 7: Run it, verify it fails**

Run: `npm test -- NewsletterSignup`
Expected: FAIL — module doesn't exist.

- [ ] **Step 8: Implement `NewsletterSignup`**

```jsx
// src/sections/NewsletterSignup/index.jsx
import { useState } from 'react'
import { subscribeToNewsletter } from '../../api/newsletterApi'
import Button from '../../components/Button'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      await subscribeToNewsletter({ email })
      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section className="bg-brand-navy px-4 py-12 text-center text-white md:px-8">
      <h2 className="text-2xl font-bold md:text-3xl">Subscribe to our Newsletter!</h2>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md px-3 py-2 text-brand-dark"
        />
        <Button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>
      {status === 'success' && <p className="mt-3 text-sm">Thanks for subscribing!</p>}
      {status === 'error' && <p className="mt-3 text-sm text-red-200">{error}</p>}
    </section>
  )
}
```

- [ ] **Step 9: Run it, verify it passes**

Run: `npm test -- NewsletterSignup`
Expected: PASS, 2 tests.

- [ ] **Step 10: Commit**

`NewsletterSignup` doesn't fetch on mount (only on form submit, which no
`Home` test triggers), so wiring it in now wouldn't actually break
`Home.test.jsx` the way Tasks 3/8/9/10's sections would. It's still left
for Task 12 anyway, purely for consistency — one single place where `Home`
is assembled and reviewed as a whole, rather than some sections wired
incrementally and others not.

```bash
git add src/api/newsletterApi.js src/api/newsletterApi.test.js src/sections/NewsletterSignup mock/server.js mock/db.json
git commit -m "feat: add newsletterApi and NewsletterSignup section"
```

---

## Task 12: Assemble the full `Home` page and update its test

**Files:**
- Modify: `src/pages/public/Home/index.jsx`, `src/pages/public/Home/Home.test.jsx`

**Interfaces:**
- Consumes: every section from Tasks 3–11, `getHomepageContent()`
  (existing).
- Produces: the final `Home` composition — the single page every other
  task has been incrementally wiring into.

- [ ] **Step 1: Write the final `Home` implementation**

```jsx
// src/pages/public/Home/index.jsx
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getHomepageContent } from '../../../api/homepageApi'
import LeadershipCarousel from '../../../sections/LeadershipCarousel'
import Hero from '../../../sections/Hero'
import KarnatakaHighlights from '../../../sections/KarnatakaHighlights'
import DistrictExplorer from '../../../sections/DistrictExplorer'
import SectorsTeaser from '../../../sections/SectorsTeaser'
import EventsTeaser from '../../../sections/EventsTeaser'
import NewsletterSignup from '../../../sections/NewsletterSignup'

export default function Home() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
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
      <LeadershipCarousel />
      <Hero title={content.hero.title} subtitle={content.hero.subtitle} />
      <KarnatakaHighlights highlights={content.highlights} />
      <DistrictExplorer />
      <SectorsTeaser />
      <EventsTeaser />
      <NewsletterSignup />
    </>
  )
}
```

- [ ] **Step 2: Update `Home.test.jsx` to mock every section's API**

The existing test only mocked `homepageApi` — now every section fetches
independently, so the test needs to mock all of them to avoid unhandled
rejections/loading states bleeding across tests:

```jsx
// src/pages/public/Home/Home.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as homepageApi from '../../../api/homepageApi'
import * as leadersApi from '../../../api/leadersApi'
import * as districtsApi from '../../../api/districtsApi'
import * as sectorsApi from '../../../api/sectorsApi'
import * as eventsApi from '../../../api/eventsApi'
import Home from './index'

vi.mock('../../../api/homepageApi')
vi.mock('../../../api/leadersApi')
vi.mock('../../../api/districtsApi')
vi.mock('../../../api/sectorsApi')
vi.mock('../../../api/eventsApi')

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    leadersApi.getLeaders.mockResolvedValue([])
    districtsApi.getDistricts.mockResolvedValue([])
    sectorsApi.getSectors.mockResolvedValue([])
    eventsApi.getEvents.mockResolvedValue([])
  })

  it('shows a loading state, then the fetched hero content', async () => {
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Explore Unlimited Trade Prospects Worldwide' },
      highlights: [],
    })

    renderHome()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
    expect(screen.getByText('Explore Unlimited Trade Prospects Worldwide')).toBeInTheDocument()
  })

  it('shows an error message when the homepage content fetch fails', async () => {
    homepageApi.getHomepageContent.mockRejectedValue({ message: 'Network error', status: 0 })

    renderHome()
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
```

- [ ] **Step 3: Run it, verify it passes**

Run: `npm test -- Home`
Expected: PASS, 2 tests.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: every test file passes (this is the first point where all
sections + `Home` + `App`/`AppRoutes` integration tests run together —
`AppRoutes.test.jsx` and `App.test.jsx` mock only `homepageApi`, so they
need the same treatment as Step 2 if they fail).

- [ ] **Step 5: If `AppRoutes.test.jsx` or `App.test.jsx` fail, apply the same fix**

Both currently do `vi.mock('../api/homepageApi')` (or `./api/homepageApi`
for `App.test.jsx`) only. Add the same four `vi.mock(...)` calls and
`beforeEach` resolves as Step 2, adjusting the relative import paths
(`../api/leadersApi` for `AppRoutes.test.jsx`, `./api/leadersApi` for
`App.test.jsx`).

- [ ] **Step 6: Run the full suite again**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/pages/public/Home src/routes/AppRoutes.test.jsx src/App.test.jsx
git commit -m "feat: assemble the full Home page from all sections"
```

---

## Task 13: Lint, build, and manual browser verification

**Files:** none created — verification only.

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no errors. Fix anything flagged (unused imports, etc.) and
re-run until clean.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests pass, no skipped tests.

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: builds successfully into `dist/`.

- [ ] **Step 4: Manual verification in a real browser**

With `npm run mock-api` and `npm run dev` both running, open the app and
confirm: the leadership carousel shows Siddaramaiah/Shivakumar/Patil and
advances on click; the hero video autoplays muted with the real title/
subtitle; the 4 highlight cards render; clicking different districts on the
Karnataka map updates the data panel (Kalaburagi shows real figures, most
others show the "not available yet" empty state); the 3 sector cards, 1
event card, and newsletter form all render and the newsletter form shows a
success message on submit.

- [ ] **Step 5: Commit any fixes found during manual verification**

```bash
git add -A
git commit -m "fix: address issues found in manual Home page verification"
```

(Skip if Step 4 found nothing to fix.)

---

## Self-Review Notes

- **Spec coverage:** all of spec §5's Home page bullet list (leadership
  carousel, hero, Karnataka highlights, district export explorer, champion
  sectors teaser, upcoming events, newsletter) has a task. §6 "District
  export explorer" is Tasks 7–8. §7 i18n: sections render `.en` copy for
  now since `LocaleContext`/`react-i18next` only cover static UI labels so
  far — full bilingual *content* rendering (switching `.en`/`.kn` per
  field) is deferred to whichever task first needs it end-to-end, since no
  section here has real Kannada content yet to render (every `kn` field in
  the mock data is `""`). Flagging this explicitly rather than leaving it
  silent: not a gap in this plan, just not yet exercised.
- **Placeholder scan:** no "TBD"/"TODO". The `null`/empty-shape mock
  entries for 29 districts and the empty `kn` strings are real seed data
  with an intentional, tested empty-state UI — not implementation stubs.
- **Type consistency:** `District.id` (Task 6) matches `KarnatakaMap`'s
  `data-district` values (Task 7) exactly — both sourced from the same
  reference SVG map extraction. `DistrictPanel`'s `district` prop shape
  (Task 8) matches what `districtsApi.getDistricts()` resolves (Task 6).
  `newsletterApi.subscribeToNewsletter({ email })` (Task 11) matches the
  `POST /newsletter/subscribe` body shape added to `mock/server.js` in the
  same task.
