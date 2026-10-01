# Roles, users, role-based access and audit logs

Today every logged-in admin can do everything: `routes/admin.js` only has
`router.use(requireAuth)`, and `AdminUser.role` is an enum (`editor` | `admin`)
that nothing checks (`requireRole` exists but is unused).

We need:

1. A **Super Admin** (director) who can create **roles**, create **users** and
   assign each user a role.
2. **Role access management**: for each role, toggle which admin **pages** it
   can use (e.g. a role that only sees Leaders, Districts and Focus Sectors).
3. **Audit logs** visible to Super Admin only: who logged in (and with which
   role), everything they changed (with before/after), and when they logged
   out — all stored permanently.

The admin UI for all of this is being built against the contract below.
**Hiding menu items is not security — the server must enforce every rule
here.** The frontend only mirrors what the server allows.

Decisions agreed with the product owner:

- Permission = **page on/off** (no separate view/edit levels for now).
- **One role per user.**
- The Super Admin sets the first password; the user must **change it at first
  login** (no invite email — SMTP isn't configured everywhere).
- Top role is called **Super Admin**.
- The existing `editor` account becomes an **"Editor"** role with every
  current page, so nobody loses access on day one.

---

## 1. Permission catalog

One permission per admin page. Keys = the sidebar keys the frontend already
uses. **Dashboard, "change my password", `/auth/*` need no permission** (any
logged-in user).

| Permission key | Admin page | Backend routes it unlocks |
|---|---|---|
| `leaders` | Leaders | `/admin/leaders*` |
| `districts` | Districts | `/admin/districts*` |
| `focusSectors` | Focus Sectors | `/admin/focus-sectors*` |
| `events` | Events | `/admin/events*` |
| `cities` | Cities | `/admin/cities*` |
| `eventSectors` | Event Sectors | `/admin/event-sectors*` |
| `offices` | Offices | `/admin/offices*` |
| `orgChart` | Org Chart | `/admin/staff*` **where `group = "org-chart"`** |
| `governingCouncil` | Governing Council | `/admin/staff*` **where `group = "governing-council"`** |
| `taluks` | Taluks | `/admin/taluks*` |
| `warehouses` | Warehouses | `/admin/warehouses*` |
| `forms` | Forms (builder + responses) | `/admin/forms*` |
| `giProducts` | GI Products | `/admin/gi-products*` |
| `giEnquiries` | GI Enquiries | `/admin/enquiries*` |
| `downloadCategories` | Download Categories | `/admin/download-categories*` |
| `downloads` | Downloads | `/admin/downloads*` |
| `pages` | Pages | `/admin/pages*` |
| `contactEnquiries` | Contact Enquiries | `/admin/contact-enquiries*` |
| `newsletterSubscribers` | Newsletter Subscribers | `/admin/newsletter/subscribers*` |
| `newsletterIssues` | Send Newsletter | `/admin/newsletter/issues*` **except** the read-only list (see `newslettersSent`) |
| `newslettersSent` | Sent Newsletters | `GET /admin/newsletter/issues` (list of sent issues) |
| `visitorAnalytics` | Visitor Analytics | `/admin/visits*` |

Notes on the mapping:

- **Staff** is one collection serving two pages. Decide the permission from the
  record's `group` — on **create** use `body.group`; on **update/delete** check
  the **existing** record's group (and the new group if the body changes it).
- `newslettersSent` and `newsletterIssues` both read the issues list, so
  `GET /admin/newsletter/issues` must be allowed if the user has **either**
  permission; the write routes (`POST`, `/:id/send`, `DELETE`) need
  `newsletterIssues`.
- `/admin/uploads` (generic file upload used by editors) → allow when the user
  has **at least one** permission; it never needs its own toggle.
- `/admin/homepage-content` and `/admin/state-exports|top-products|country-products/bulk-replace`
  have no admin page in the current UI: **Super Admin only** (default-deny, below).
- The **public** read endpoints the admin forms use for dropdown data
  (`GET /cities`, `/event-sectors`, `/districts`, `/gi-products`, …) stay public,
  so a role can open an editing page without also holding the permission of
  the pages that feed its dropdowns.
- **Default deny:** any `/admin/*` route that isn't in the table above must
  require Super Admin. A new page can't be accidentally left open; it just
  stays Super-Admin-only until it's added to the catalog.

### Access-control pages (Super Admin only — not grantable)

`/admin/roles*`, `/admin/users*`, `/admin/audit*`. They are **not** in the
catalog and a role can never be granted them (privilege-escalation risk).

---

## 2. Data model

### `Role`

```js
{
  name:        String, required, unique (case-insensitive), 2–60 chars,
  slug:        String, unique, generated from name (stable id for code, e.g. "super-admin"),
  description: String, ≤ 300 chars, default "",
  permissions: [String],   // subset of the catalog keys above; each validated
  isSystem:    Boolean,    // true only for "Super Admin" — cannot be edited/deleted
  createdAt, updatedAt
}
```

- **Super Admin** = the one `isSystem` role. It has implicit access to
  **everything**, including pages added later, so don't store a list for it
  (store `[]` or ignore it). Everything below says `isSuperAdmin` for
  `role.isSystem === true`.

### `AdminUser` changes

```js
role:               ObjectId (ref Role, required)   // replaces the string enum
isActive:           Boolean, default true           // deactivated users cannot log in / are logged out at once
mustChangePassword: Boolean, default false          // true after create / reset by an admin
lastLoginAt:        Date
```

Keep `email` unique, `passwordHash` (bcrypt, cost 12 as now), `name`.
Passwords: min 8 characters (also enforce at least one letter and one number).
**Never** return `passwordHash`.

---

## 3. Enforcement (middleware)

- `attachUser` already loads the user per request: also populate the **role**
  and compute `req.permissions` (`Set`) on every request — **never cache
  permissions in the session**, so a role change applies immediately without
  re-login.
- If `user.isActive === false` (or the user no longer exists): destroy the
  session, `401`, and record the session end (§6).
- `requirePermission(key)` / `requireAnyPermission(...keys)` /
  `requireSuperAdmin`:
  - not logged in → `401 { message }`
  - logged in without access → `403 { "message": "You do not have access to this section", "code": "FORBIDDEN" }`
    and write an `access_denied` audit event (§6).
- Wire it from **one table** (route prefix → permission key) in `admin.js`,
  e.g. `router.use("/leaders", requirePermission("leaders"))`, so adding a page
  is a one-line change. Add a final `router.use(requireSuperAdmin)` **after**
  all mapped routes as the default-deny.
- **Password-change gate:** while `user.mustChangePassword` is `true`, every
  `/admin/*` request returns `403 { "code": "PASSWORD_CHANGE_REQUIRED" }`
  except `GET /auth/me`, `POST /auth/change-password` and `POST /auth/logout`.

---

## 4. Auth API changes

`POST /auth/login` and `GET /auth/me` both return:

```json
{
  "id": "…", "name": "Asha Rao", "email": "asha@vtpc.gov.in",
  "role": { "id": "…", "name": "Content Editor", "slug": "content-editor", "isSuperAdmin": false },
  "permissions": ["leaders", "districts", "focusSectors"],
  "isSuperAdmin": false,
  "mustChangePassword": false
}
```

- For Super Admin: `isSuperAdmin: true` and `permissions` = **every** catalog
  key (so the UI doesn't need a special case).
- Login also: rejects deactivated users with the same generic
  `401 "Invalid email or password"` (do not reveal the account state), updates
  `lastLoginAt`, and **creates an audit session** (§6).
- Add the standard login rate limit if not already present (per IP + per email).

`POST /auth/change-password` — `{ "currentPassword", "newPassword" }` →
`200 { message }`; verifies the current password, applies the password rules,
clears `mustChangePassword`, records `password_change` in the audit log.
Available to every logged-in user.

`POST /auth/logout` — also closes the audit session (§6).

---

## 5. Roles & users API (Super Admin only)

### Catalog

`GET /admin/permissions` → the catalog the server enforces, so UI and server
can never disagree:

```json
[ { "group": "Home Page", "items": [ { "key": "leaders", "title": "Leaders" } ] } ]
```

Groups should match the sidebar: *Home Page, Events, Organisation, Exporter
Corner, Content & Resources, Site & Newsletter*.

### Roles

| Request | Notes |
|---|---|
| `GET /admin/roles` | → `[{ id, name, slug, description, permissions, isSystem, userCount, createdAt, updatedAt }]` (Super Admin first, then A–Z) |
| `POST /admin/roles` | `{ name, description?, permissions? }` → `201`. `409` if the name exists |
| `PUT /admin/roles/:id` | `{ name, description }`. System role → `403` |
| `PUT /admin/roles/:id/permissions` | `{ "permissions": ["leaders", …] }` — replaces the whole list; **validate every key against the catalog** (`400` on unknown). System role → `403`. Audit: `permissions_change` with the **added and removed keys** |
| `DELETE /admin/roles/:id` | `409 { message }` while any user has the role; system role → `403` |

### Users

| Request | Notes |
|---|---|
| `GET /admin/users` | → `[{ id, name, email, role: { id, name, slug, isSuperAdmin }, isActive, mustChangePassword, lastLoginAt, createdAt }]` |
| `POST /admin/users` | `{ name, email, roleId, password }` → `201`. Sets `mustChangePassword: true`. `409` if the email exists |
| `PUT /admin/users/:id` | `{ name, email, roleId }` |
| `PATCH /admin/users/:id` | `{ "isActive": true \| false }` — deactivating also ends their active sessions (`endedBy: "deactivated"`) |
| `POST /admin/users/:id/reset-password` | `{ "newPassword" }` → sets `mustChangePassword: true`, ends their active sessions |
| `DELETE /admin/users/:id` | Their audit history is **kept** (it stores name/email/role snapshots) |

---

## 6. Safety rails

- There must **always be at least one active Super Admin**: refuse (`409`) to
  deactivate, delete or re-role the last one.
- A user can't deactivate, delete or change the role of **themselves**
  (`409`).
- The **Super Admin role** can't be edited, renamed, deleted or have its
  permissions changed.
- Only a Super Admin can create/assign the Super Admin role.
- Don't allow granting access-control pages through permissions (§1).

---

## 7. Audit logs

**Super Admin only. Append-only: there is no endpoint to edit or delete an
entry.** Store them permanently (optional env `AUDIT_RETENTION_DAYS`, default
keep forever). Never store passwords, password hashes, session ids/cookies or
file contents.

### 7.1 What to record

| `action` | When | Notes |
|---|---|---|
| `login` | successful login | session starts |
| `login_failed` | wrong password / unknown or deactivated email | store the attempted email and a `reason`; no actor |
| `logout` | user clicks Logout | session ends, `endedBy: "logout"` |
| `session_expired` | session lapsed (cookie `maxAge` / idle) or the user was deactivated/reset | see §7.3 |
| `create` | any admin POST that creates a record | `resource`, `target.id`, `target.label` |
| `update` | PUT / PATCH that edits a record | **with `changes`** (§7.2) |
| `delete` | DELETE | include the deleted record's label and a compact snapshot in `changes` (`from` only) |
| `status_change` | toggles: form active/inactive, enquiry contacted, subscriber blocked, … | `changes` has the one field |
| `send` | newsletter sent | `target.label` = subject, summary includes recipient count |
| `permissions_change` | role access toggles | `changes` = `[{ field: "permissions", from: [...], to: [...] }]` plus a summary "added X, removed Y" |
| `password_change` / `password_reset` | self change / admin reset | **never** the password itself |
| `access_denied` | a 403 | `resource`/path they tried |

Resources for the access-control area: `users`, `roles`, `roleAccess`.
For everything else, `resource` = the permission key (`leaders`, `forms`, …).
Reads (GET) are **not** logged, except nothing else.

### 7.2 `AuditLog` shape

```js
{
  at:        Date (UTC, indexed desc),
  sessionId: String,       // links login → changes → logout (see §7.3); null for login_failed
  actor:     { id, name, email },          // SNAPSHOT at the time (user may be renamed/deleted later)
  role:      { id, name },                 // SNAPSHOT of the role at the time
  action:    String (enum above),
  resource:  String | null,                // permission key or users/roles/roleAccess
  target:    { id: String | null, label: String },   // e.g. { id: "…", label: "Shri M.B. Patil" }
  summary:   String,                       // one readable line: "Updated leader “Shri M.B. Patil”"
  changes:   [{ field: String, from: Mixed, to: Mixed }],
  status:    "success" | "failed",
  method:    String, path: String,         // e.g. "PUT", "/admin/leaders/6abc…"
  ip:        String, userAgent: String
}
```

**`changes` for updates** (the "everything they changed" requirement):

- Compare the record **before** and **after** (load the "before" document in
  the crud layer / controller before saving).
- Report only fields that changed. Use **dot paths** for nested values
  (`title.en`, `description.kn`, `statBoxes`).
- Arrays of objects (questions, stat boxes…): record the **before and after
  arrays** (truncate each serialized value to ~2,000 chars and add
  `"truncated": true`), or a compact "6 → 7 items" plus the changed
  element — the UI shows `from → to` text, so either is fine as long as it is
  human-readable.
- File fields (photo, image, video, PDF): store the **file name/URL**, not the
  content.
- **Redact**: `password`, `passwordHash`, tokens, anything secret → `"[hidden]"`.
- For `create`, `changes` may list the main fields as `from: null → to: value`
  (or be empty with a good `summary`).
- A failed request (4xx/5xx) is not logged as a change, except `login_failed`
  and `access_denied`.

Implement as one helper (e.g. `audit.record(req, { action, resource, target, changes })`)
called from a central place — the generic `makeCrud` create/update/remove
plus the custom controllers (forms, newsletter, enquiries, users, roles) — so
nothing mutating is missed. Log **after** the write succeeds. A failure to
write the audit entry must not break the user's request (log the error), but
should be loud in the server logs.

### 7.3 Sessions (login / logout times)

Every login creates an **audit session**; its id is stored on each event.

```js
AuditSession {
  id (= sessionId), actor snapshot, role snapshot,
  loginAt:        Date,
  logoutAt:       Date | null,
  endedBy:        "logout" | "expired" | "deactivated" | "password_reset" | null,   // null = still active
  lastActivityAt: Date,         // updated on authenticated requests (throttle to ~1 write/minute)
  ip, userAgent,
  changeCount:    Number        // create/update/delete/status_change/send events in this session
}
```

- **Logout** → set `logoutAt = now`, `endedBy = "logout"`, write a `logout` event.
- Sessions can last for days (`sessionDays`), and users often just close the
  tab. When a session's cookie has expired, or it has been idle past the idle
  limit you choose, mark it ended with `endedBy: "expired"` and
  `logoutAt = lastActivityAt` (or the expiry time) and write a
  `session_expired` event. Do this with a small periodic job (every few
  minutes) **and** lazily when a stale session id is seen. The UI shows
  "Still active" only while `logoutAt` is null.
- Deactivation / password reset by a Super Admin → close that user's open
  sessions with the matching `endedBy`.

### 7.4 Endpoints (Super Admin only)

```
GET /admin/audit/logs?from=&to=&userId=&roleId=&action=&resource=&sessionId=&q=&page=&limit=
→ { "items": [AuditLog…], "total": 1234 }        // newest first; from/to = ISO dates (inclusive, UTC)

GET /admin/audit/logs/:id            → one AuditLog (with full changes)
GET /admin/audit/logs/export?…same filters…   → text/csv (UTF-8 BOM), one row per event:
        at, actor name, actor email, role, action, resource, target, summary, ip

GET /admin/audit/sessions?from=&to=&userId=&roleId=&active=&page=&limit=
→ { "items": [AuditSession…], "total": n }       // newest login first; active=true → only open sessions

GET /admin/audit/sessions/:id
→ { "session": AuditSession, "events": [AuditLog…] }   // everything done in that session, oldest first
```

- `q` searches `actor.name`, `actor.email`, `summary` and `target.label`.
- `limit` default 25, max 100.
- Indexes: `at: -1`; `{ "actor.id": 1, at: -1 }`; `{ "role.id": 1, at: -1 }`;
  `{ resource: 1, at: -1 }`; `{ sessionId: 1, at: 1 }`; sessions
  `{ loginAt: -1 }`.

---

## 8. Migration (run once, idempotent)

1. Create the **Super Admin** role (`isSystem: true`).
2. Create the **Editor** role with **all** catalog permissions.
3. Every existing user: `role: "admin"` → Super Admin; `role: "editor"` →
   Editor. Set `isActive: true`, `mustChangePassword: false`.
4. Keep (or drop) the old string field once nothing reads it.
5. Make sure at least one active Super Admin exists afterwards; if only the
   `editor@vtpc.gov.in` account exists, **promote it to Super Admin** (the
   product owner will then create real roles/users from the UI).

---

## 9. Acceptance checks

1. Super Admin creates a role **"Content Editor"** with only `leaders`,
   `districts`, `focusSectors` toggled on.
2. Super Admin creates a user (name, email, role, password); that user logs in
   and is forced to change the password first.
3. As that user: `GET /admin/leaders` area works; `PUT /admin/events/:id`,
   `GET /admin/forms`, `GET /admin/users`, `GET /admin/audit/logs` all return
   **403** (and appear as `access_denied` in the audit log).
4. Super Admin turns `events` on for the role → the same user can edit events
   **without logging in again**; turning it off blocks them again immediately.
5. Org Chart vs Governing Council: a role with only `orgChart` can create/edit
   `/admin/staff` records with `group: "org-chart"` but gets **403** for
   `group: "governing-council"`, including when trying to change a record's
   group.
6. Deactivating the user ends their session at once (next request `401`) and
   writes a `session_expired`/`deactivated` entry.
7. The last Super Admin cannot be deleted, deactivated or demoted; nobody can
   edit their own role.
8. Audit log shows, for the test user: `login` (with role name and IP) →
   `update` of a leader with before/after of the changed fields → `logout`;
   the **session** shows login time, logout time, and the change count; failed
   logins appear as `login_failed`. No password or hash appears anywhere.
9. Deleting a role with users → `409`; deleting a user keeps their audit
   history readable (names are snapshots).
10. No endpoint can modify or delete an audit entry.
