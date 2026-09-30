# Downloads page — dynamic categories + two-level documents

Building the public Downloads page (category sections → documents → some
documents expand to show nested sub-documents, each with View/Download)
plus two admin CRUD screens: **Download Categories** (create/rename/reorder
categories, e.g. "State Promotional Policies", "Logistics Sector",
"Champion Services Scheme Reports") and **Downloads** (documents, each
assigned to a category and optionally nested under another document in the
same category).

## Current state

`Download` already exists (`src/models/Download.js`) with full CRUD routes
(`GET /downloads`, `POST/PUT/DELETE /admin/downloads/:id`, upload wired to
`uploads/downloads/`) — but `category` is a **fixed 4-value enum**
(`Policy`/`RTI`/`Report`/`Form`), there's no concept of an admin-managed
category list, and there's no way to nest one document under another. None
of that fits what's being built now, so this doc requests replacing the
enum with a real `DownloadCategory` collection plus two new fields on
`Download`.

## 🔴 New resource: `DownloadCategory`

```
GET    /download-categories              public, list
POST   /admin/download-categories        auth required, JSON body
PUT    /admin/download-categories/:id    auth required, JSON body
DELETE /admin/download-categories/:id    auth required
```

```json
{ "id": "...", "name": { "en": "State Promotional Policies", "kn": "..." }, "order": 1 }
```

Suggested Mongoose model (same shape/plugins as `EventSector`):

```js
const mongoose = require("mongoose");
const { bilingualSchema } = require("./schemas/common");
const { apiJson } = require("./plugins/apiJson");

const downloadCategorySchema = new mongoose.Schema(
  {
    name: { type: bilingualSchema, default: () => ({}) },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

apiJson(downloadCategorySchema);

module.exports = mongoose.model("DownloadCategory", downloadCategorySchema);
```

Register it the same way `EventSector` is registered (`makeCrud` in
`resourcesController.js`, routes in `public.js`/`admin.js`) — no bespoke
controller logic needed, this is a plain CRUD resource like every other
master-data list in this project.

## 🔴 Schema change: `Download`

```diff
 const downloadSchema = new mongoose.Schema(
   {
     title: { type: bilingualSchema, default: () => ({}) },
-    category: {
-      type: String,
-      enum: ["Policy", "RTI", "Report", "Form"],
-      required: true,
-    },
+    category: { type: String, required: true, trim: true }, // DownloadCategory id (_id string)
+    parent: { type: String, default: null, trim: true },    // Download id, or null for a top-level document
+    order: { type: Number, default: 0 },
     fileUrl: { type: String, default: "" },
     uploadedAt: { type: Date, default: Date.now },
   },
   { timestamps: true }
 );
```

No route or controller changes needed — `makeCrud`'s generic
`Object.assign(doc, body)` picks up `parent`/`order` automatically once
they're on the schema, and `category` already accepts any string once the
`enum` is removed. The existing upload wiring
(`fileFields: { fileUrl: "downloads" }`) is untouched.

`parent` is nullable/omittable — a document with no `parent` renders as a
top-level entry in its category; a document whose `parent` points at
another `Download`'s id renders as an expandable sub-document under it.
The frontend only lets admins nest one level deep (a document that already
has a parent can't itself be chosen as someone else's parent) — this is
enforced client-side only, not something the schema needs to validate.

## How the frontend uses this

- **Admin → Download Categories**: plain list/create/edit/delete, exactly
  like Event Sectors. `order` controls the section order on the public
  page.
- **Admin → Downloads**: table view (grouped so each top-level document is
  immediately followed by its sub-documents). The form has a "Parent
  document" dropdown scoped to top-level documents in the currently
  selected category, so nesting only ever happens within one category.
- **Public Downloads page**: one card per category (in `order`), each
  listing its top-level documents; a document with sub-documents shows a
  chevron + count and expands in place to reveal them, each with its own
  View (opens in a new tab) and Download button.

## Open item (not blocking)

- 🟡 **Real file downloads currently rely on the browser's `download`
  attribute**, which only forces a "Save As" for same-origin or
  CORS-permitting responses — it's inconsistent cross-browser without a
  `Content-Disposition: attachment` header from the server. If you'd like
  the Download button to reliably force a save dialog instead of possibly
  just opening the file, add that header to the `/uploads/downloads/*`
  static response (or a small `GET /downloads/:id/file` redirect that sets
  it). Not blocking — "View" already opens the file fine either way, and
  the Download button still works in most browsers as-is.

## Real content — done

**Update (2026-09-30):** schema change confirmed live (`GET
/download-categories` works, `Download` now returns `parent`/`order`).
Found 3 old test rows still using the previous enum values
(`Policy`/`RTI`/`Report`/`Form`) — deleted them since they didn't match
anything real. Seeded the actual live site structure instead: **8
categories** (State Promotional Policies, Logistics Sector, Champion
Services Scheme Reports, District Level Export Hubs (DLEH), Export
Opportunities - Countries Report, Geographical Indications (GI),
Downloads, Spotlight on Karnataka's District Exports) and **120
documents** (33 top-level, 87 nested — e.g. "District Export Action
Plans" expands to all 30 districts, "VTPC Newsletter" expands to 7
issues), extracted from `download.php` in the WordPress source. Files
came from two places: local PDFs already in the source export
(`assets/pdf/districts/`, `District Farm Product/`, `Countries Report/`,
`GI study report/`), and the remaining ones fetched directly from the
live site (`vtpc.karnataka.gov.in`, cert expired so fetched with
TLS verification disabled) and re-uploaded through the same admin
multipart endpoint the admin form uses. All 120 uploads succeeded; a few
spot-checked file URLs verified 200 OK. One deliberate omission: the live
site's "Registered Geographical Indications" row has ~49 sub-items with
dead `href="#"` placeholder links in the source HTML — not real content,
so those weren't recreated; the row's own real combined PDF link was kept.
