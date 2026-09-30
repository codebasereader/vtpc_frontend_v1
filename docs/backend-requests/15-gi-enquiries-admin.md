# GI Enquiries — admin screen, "contacted" tracking

New admin page **GI Enquiries** (`/admin/gi-enquiries`, under *Content &
Resources*) lists every enquiry submitted from "Enquire now" on Karnataka's GI
Treasures:

- newest first (with an oldest-first toggle)
- filters: **product** dropdown (with counts), status (**All / Pending /
  Contacted**), free-text search (name, email, phone, message, product) and a
  received-date range
- **Export CSV**: all enquiries, only the selected product, or the current
  filtered results
- a **"Mark as contacted"** button per enquiry (with Undo), a "New" badge on
  uncontacted enquiries < 48 h old, and a detail drawer with the full message

Everything except the "contacted" tracking works on today's backend: the page
uses the existing `GET /admin/enquiries` (already sorted by `createdAt` desc)
and filters/sorts/exports **in the browser**. Verified: the endpoint responds
(`[]` — no enquiries exist yet).

## 🔴 1. `contacted` tracking on `Enquiry`

Add to `models/Enquiry.js`:

```js
contacted:   { type: Boolean, default: false },
contactedAt: { type: Date, default: null },
contactedBy: { type: String, default: "" },   // optional: "Name <email>" of the admin
```

- Default is `false`, so every existing enquiry counts as **pending** — no
  migration is required (a missing `contacted` is treated as `false`).
- `GET /admin/enquiries` must return these fields (they will once they're on
  the schema), so the page can show *"Contacted · 12 Oct 2026"*.

## 🔴 2. New endpoint

```
PATCH /admin/enquiries/:id
body: { "contacted": true | false }
→ 200  the updated enquiry (same shape as the list items)
```

- `requireAuth` like the other admin routes; 404 if the id doesn't exist;
  400 if `contacted` isn't a boolean.
- When `contacted` becomes `true`: set `contactedAt = now` and (optionally)
  `contactedBy` from the logged-in user. When it becomes `false` (the
  **Undo** button): set `contactedAt = null`, `contactedBy = ""`.
- Only these fields are editable through this route; the visitor's name,
  email, phone and message must stay immutable.

The UI updates optimistically and **rolls back with an error banner** if this
call fails, so a missing endpoint shows up as an error rather than silently
losing the click.

## 🟡 3. Recommended: keep the product name with the enquiry

`Enquiry.productId` stores the product **slug**; the page resolves the readable
name from `GET /gi-products`. If a GI product is later renamed or deleted, old
enquiries would show only the raw slug. Please also store the name at the time
of the enquiry:

```js
productName: { type: String, default: "" },   // English name, snapshot
```

set in `enquiryController.create` from the matching `GIProduct` (fall back to
the slug if not found). The admin page will prefer the live product name and
fall back to this snapshot once it's returned — tell me when it's in and I'll
wire it up.

## 🟡 4. Recommended: validate `productId` on create

`POST /enquiries` currently accepts any string as `productId`. Please reject
(400) an id that doesn't match an existing GI product, so the product filter
never contains junk values.

## 🟢 5. Optional / later

- **Server-side filtering & paging** for when enquiries reach the thousands:
  `GET /admin/enquiries?product=<slug>&status=pending|contacted&from=&to=&q=&page=&limit=`
  returning `{ items, total }`. The UI currently loads everything and
  filters in the browser (fine for hundreds).
- **Export endpoint** `GET /admin/enquiries/export?product=<slug>` streaming a
  CSV, for very large exports. The admin currently builds the CSV from the
  loaded data (UTF-8 with BOM so Excel shows Kannada text correctly).
- **Email notification** to an admin inbox when a new enquiry is submitted
  (the SMTP mailer already exists), so enquiries aren't missed.
- **Internal note** on an enquiry (`adminNote: String`) for follow-up
  comments.

## Checks

- Submit an enquiry from a GI product on the public site → it appears at the
  top of **GI Enquiries** with a "New" badge, under the right product.
- **Mark as contacted** → the card turns green with today's date; the
  Pending/Contacted counts and tabs update; refresh the page — it's still
  contacted. **Undo** returns it to pending.
- Filter by a product → the export menu offers *All enquiries* and
  *Only <product>*; each downloads the matching rows.
- An enquiry for a deleted product still shows (raw slug now; name snapshot
  once item 3 is done).
