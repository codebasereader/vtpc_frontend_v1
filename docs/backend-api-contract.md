# VTPC Backend API Contract

For: Node/Express + MongoDB backend (built separately from this repo)
From: `vtpc_frontend_v1` React app
Status: Draft — matches what the frontend currently calls / will call. Flag
anything here that's impractical on your end rather than silently deviating;
the frontend's `api/*.js` files are the single source of truth for what
shape each call expects, so any change should update both sides.

## 1. How the frontend talks to this API

- **Base URL**: the frontend reads one env var, `VITE_API_BASE_URL` (e.g.
  `http://localhost:4000` in dev). Every request goes through a single
  Axios client — no path is hardcoded anywhere else in the frontend.
- **CORS**: must allow credentials from the frontend's origin(s) —
  `Access-Control-Allow-Credentials: true` and an explicit
  `Access-Control-Allow-Origin` (not `*`, which doesn't work with
  credentialed requests).
- **Auth transport**: httpOnly, Secure cookie set by *you* on login — the
  frontend never reads, stores, or sends a bearer token itself. Every
  request is sent with `withCredentials: true` (cookies included
  automatically by the browser). See §3.
- **Error shape**: on any non-2xx response, return a JSON body with at
  least a `message` field:
  ```json
  { "message": "Human-readable error message" }
  ```
  The frontend's Axios interceptor reads `response.data.message` and falls
  back to a generic message if it's missing — so a bare `500` with no body
  still works, but a real message is much better for the admin UI's error
  states.
- **Content language**: any field that holds editor-authored copy (not a
  UI label — those live in the frontend's own i18n files) is stored and
  returned as a two-language object:
  ```json
  { "en": "English text", "kn": "ಕನ್ನಡ ಪಠ್ಯ" }
  ```
  Kannada may be an empty string until an editor fills it in — the frontend
  falls back to English when the active-language string is empty.

## 2. Collections overview

| Collection | Purpose | List? | Detail? | Singleton? |
|---|---|---|---|---|
| `Page` | Legal/info pages (privacy policy, etc.) | — | by `slug` | — |
| `Leader` | CM/Dy.CM/Minister carousel | yes | — | — |
| `District` | Per-district export data (30 Karnataka districts) | yes | by `id` | — |
| `FocusSector` | "Champion Service Sectors" | yes | by `id` | — |
| `GIProduct` | Geographical Indications products | yes | by `id` | — |
| `Enquiry` | GI product "Enquire Now" submissions | — | — | write-only |
| `Office` | Regional offices | yes | — | — |
| `StaffMember` | Org chart + governing council | yes | — | — |
| `Event` | Upcoming/past events | yes | by `id` | — |
| `Download` | Downloadable documents (policies, RTI, reports) | yes | — | — |
| `HomepageContent` | Homepage hero/highlights copy | — | — | yes |
| `NewsletterSubscriber` | Newsletter signups | yes (admin only) | — | write path is public |
| `AdminUser` | CMS editor accounts | — | — | — (auth only, no public CRUD) |

Every collection except `AdminUser` needs public **read** endpoints (used by
the citizen-facing site) and admin-only **write** endpoints (create/update/
delete, used by the CMS dashboard, protected by the auth in §3).

## 3. Auth

Session-based, cookie-only. No JWT or token is ever returned in a response
body.

### `POST /auth/login`
Request body:
```json
{ "email": "editor@vtpc.gov.in", "password": "..." }
```
On success: set the session cookie (`Set-Cookie`, httpOnly, Secure,
`SameSite=Lax` or stricter), respond `200` with the user's public profile —
**never** the password hash or the token itself:
```json
{ "id": "664f...", "name": "Editor Name", "role": "editor" }
```
On failure: `401` with `{ "message": "Invalid email or password" }`.

### `POST /auth/logout`
Clears the session cookie. `200` with `{ "message": "Logged out" }` (or
empty body — frontend doesn't inspect it).

### `GET /auth/me`
**Needed but not yet called by the frontend** — the admin app will add this
in its next build phase, to restore login state after a page refresh
(cookie persists across reloads, but Redux state doesn't). Behavior:
- Valid session cookie → `200` with the same user shape as login.
- No/expired session → `401`.

### Protecting admin write routes
Every create/update/delete endpoint below must check the session cookie and
reject with `401` (no session) or `403` (wrong role, if you add roles beyond
`editor`) before touching the database.

## 4. Endpoints by collection

Unless noted, list endpoints return a plain JSON array (no pagination
envelope needed at current content volumes — flag if that changes).

### Page
```
GET  /pages/:slug                → single Page or 404
POST /admin/pages                → create (admin)
PUT  /admin/pages/:id             → update (admin)
DELETE /admin/pages/:id           → delete (admin)
```
Known slugs the frontend will request: `privacy-policies`, `security-policy`,
`copyright-policy`, `hyperlinking-policy`, `terms-conditions`,
`screen-reader-access`, `help`.
```json
{
  "id": "664f...",
  "slug": "privacy-policies",
  "title": { "en": "Privacy Policy", "kn": "" },
  "body": { "en": "<rich text / HTML>", "kn": "" }
}
```

### Leader
```
GET  /leaders                     → array, ordered by `order` ascending
POST /admin/leaders               → create
PUT  /admin/leaders/:id           → update
DELETE /admin/leaders/:id
```
```json
{ "id": "...", "name": "Shri M.B. Patil", "designation": { "en": "Hon'ble Minister for LMI and Infrastructure Development", "kn": "" }, "photo": "https://.../leader.jpg", "order": 1 }
```

### District
```
GET  /districts                   → array (all 30, unordered is fine — frontend sorts alphabetically for display)
GET  /districts/:id
POST /admin/districts
PUT  /admin/districts/:id
DELETE /admin/districts/:id
```
```json
{
  "id": "kalaburagi",
  "name": "Kalaburagi",
  "tagline": { "en": "Tur Bowl of Karnataka", "kn": "" },
  "totalExportValueCr": 129.67,
  "countries": [{ "name": "Indonesia", "percentage": 32.19 }],
  "products": [{ "name": "Sugars and Sugar Confectionery", "percentage": 22.80 }],
  "sectors": [{ "name": "Agriculture", "percentage": 25.9 }]
}
```
`id` should be a URL-safe slug of the district name (e.g. `bengaluru-urban`)
— the frontend's Karnataka SVG map matches districts to data by this slug,
not by MongoDB's `_id`.

### FocusSector
```
GET  /focus-sectors
GET  /focus-sectors/:id
POST /admin/focus-sectors
PUT  /admin/focus-sectors/:id
DELETE /admin/focus-sectors/:id
```
```json
{
  "id": "pharmaceutical-biotech",
  "name": { "en": "Pharmaceutical & Biotech", "kn": "" },
  "image": "https://.../pharma.jpg",
  "description": { "en": "...", "kn": "" },
  "statBoxes": [{ "value": "40%", "label": { "en": "of Pharma products exported overseas", "kn": "" } }],
  "yearlyChart": [{ "year": "FY-2023", "valueUsdMn": 1039.27 }],
  "topMarkets": [{ "country": "USA", "percentage": 31.93 }],
  "keyInsights": { "en": "...", "kn": "" }
}
```

### GIProduct
```
GET  /gi-products
GET  /gi-products/:id
POST /admin/gi-products
PUT  /admin/gi-products/:id
DELETE /admin/gi-products/:id
```
```json
{
  "id": "bidriware",
  "name": { "en": "Bidriware", "kn": "" },
  "category": "Handicraft",
  "image": "https://.../bidriware.jpg",
  "video": "https://.../bidriware-gi-short.mp4",
  "summary": { "en": "Short card copy...", "kn": "" },
  "story": { "en": "Longer 'Learn more' copy...", "kn": "" }
}
```
`video` is optional — a few GI products (Bidriware, Channapatna toys) have a
short video in addition to a photo; most only have a photo.

### Enquiry (write-only from the public site)
```
POST /enquiries
```
Request:
```json
{ "productId": "bidriware", "name": "...", "email": "...", "phone": "...", "message": "..." }
```
`200`/`201` with `{ "message": "Enquiry received" }`. No public read access;
admins view submissions via:
```
GET /admin/enquiries          → array, newest first
```

### Office
```
GET  /offices
POST /admin/offices
PUT  /admin/offices/:id
DELETE /admin/offices/:id
```
```json
{ "id": "...", "name": "Head Office", "city": "Bengaluru", "address": { "en": "...", "kn": "" }, "phone": "080-...", "email": "info@vtpc.gov.in", "mapLink": "https://maps.google.com/..." }
```

### StaffMember
```
GET  /staff                       → array; frontend filters by `group` client-side
POST /admin/staff
PUT  /admin/staff/:id
DELETE /admin/staff/:id
```
```json
{ "id": "...", "name": "...", "role": "Chairman", "group": "org-chart", "order": 1, "photo": "https://.../photo.jpg" }
```
`group` is `"org-chart"` or `"governing-council"`.

### Event
```
GET  /events                      → array, sorted by `date` ascending
GET  /events/:id
POST /admin/events
PUT  /admin/events/:id
DELETE /admin/events/:id
```
```json
{ "id": "...", "title": { "en": "...", "kn": "" }, "date": "2026-11-01", "location": { "en": "Bengaluru", "kn": "" }, "description": { "en": "...", "kn": "" }, "registrationLink": "https://forms.gle/..." }
```

### Download
```
GET  /downloads                   → array; frontend filters by `category` client-side
POST /admin/downloads             → multipart/form-data (file + metadata) — see §5
PUT  /admin/downloads/:id
DELETE /admin/downloads/:id
```
```json
{ "id": "...", "title": { "en": "Industrial Policy 2025-2030", "kn": "" }, "category": "Policy", "fileUrl": "https://.../industrial-policy.pdf", "uploadedAt": "2025-06-01T00:00:00.000Z" }
```
`category` is one of `Policy`, `RTI`, `Report`, `Form`.

### HomepageContent (singleton)
```
GET  /homepage-content
PUT  /admin/homepage-content       → replaces the whole document
```
```json
{
  "hero": { "title": "Gateway to Global Markets: Exporters Guide", "subtitle": "Explore Unlimited Trade Prospects Worldwide" },
  "highlights": [{ "title": "Diverse Economy", "description": "..." }]
}
```
(`hero`/`highlights` copy is currently English-only in the mock — bilingual
support for this one can follow the same `{en,kn}` pattern once the CMS
form for it exists; not a blocker for now.)

### NewsletterSubscriber
```
POST /newsletter/subscribe        → public
GET  /admin/newsletter/subscribers → admin, array
GET  /admin/newsletter/subscribers/export → admin, CSV file download
```
```json
{ "email": "someone@example.com" }
```
`201` on success. If the email already exists, treat as idempotent success
rather than an error (`200`), so a repeat signup isn't confusing to the user.

## 5. File uploads

`Download.fileUrl`, `GIProduct.image`/`video`, `FocusSector.image`,
`Leader.photo`, `StaffMember.photo` all need real files behind them. Two
options, your call:
1. **Direct upload to the write endpoint** — `POST`/`PUT` as
   `multipart/form-data` with the file plus the other fields; you store it
   (S3, disk, whatever) and save the resulting URL.
2. **Separate upload endpoint** — `POST /admin/uploads` returns a URL, which
   the admin UI then includes in the normal JSON create/update call.

Either works from the frontend's side; tell us which and the admin CRUD
plan will build its forms accordingly. Whatever you choose, returned URLs
must be publicly reachable (the citizen-facing site loads them directly, no
auth).

## 6. Known gaps / open questions for you

- **`GET /auth/me`** (§3) isn't built into the frontend yet but will be
  needed for the admin session to survive a page refresh — please include
  it from the start rather than bolting it on later.
- **Pagination**: not implemented anywhere yet. Fine at current content
  volumes (dozens to low hundreds of records per collection); flag if you'd
  rather build it in from day one.
- **Rate limiting / spam protection** on `POST /enquiries` and
  `POST /newsletter/subscribe` (public, unauthenticated) is your call — the
  frontend just needs a stable response shape regardless of whether you add
  a captcha or throttle.
- **Kannada content**: every `{en, kn}` field should accept `kn` as an
  empty string (not required) — real Kannada content gets filled in by
  editors after launch, not at migration time.
