# Karnataka GI Treasures + Artisanal Stories (Geographical Indications page)

## 🔴 New request (2026-09-29): `featured` boolean on `GIProduct`

The user wants a per-product "Featured" toggle in the admin GI Product
form/list, independent of `category` (e.g. Bidriware is both
`Handicrafts Products` *and* featured — a single-value `category` string
can't represent that). One-line schema addition, no route/controller
changes needed since `makeCrud`'s generic `Object.assign(doc, body)`
already picks up any new schema field automatically:

```js
// src/models/GIProduct.js
featured: { type: Boolean, default: false },
```

The frontend already sends `featured` (`"true"`/`"false"`) on every
create/update multipart request — Mongoose casts that string fine once the
field exists — so nothing else changes on your end. Until this field is
added, the admin toggle UI is visible and functional but has no effect
(the value is silently dropped by `Object.assign` since it's not a schema
key), and the public "Featured Products" tab stays empty. The intended
featured set (matching the live reference site) is **Bidriware, Mysore
Silk, Mysore Sandal Soap** — we'll flip those three on via the admin
toggle as soon as this lands.

Building the "Karnataka GI Treasures" (category tabs → product list → product
detail + Enquire Now) and "Artisanal Stories" (craft video grid) sections on
the public Geographical Indications page, plus an admin CRUD screen for GI
products, shown as a table.

## ✅ No schema changes needed — `GIProduct` and `Enquiry` already fully cover this

Read `src/models/GIProduct.js`, `src/models/Enquiry.js`,
`src/routes/public.js` and `src/routes/admin.js` directly before starting —
both models, their full CRUD routes, and file-upload wiring already exist
and are live:

```
GET    /gi-products              public, list
GET    /gi-products/:id          public, get by slug
POST   /admin/gi-products        auth required, multipart/form-data
PUT    /admin/gi-products/:id    auth required, multipart/form-data
DELETE /admin/gi-products/:id    auth required

POST   /enquiries                public, JSON body, rate-limited
GET    /admin/enquiries          auth required, list (no admin UI built for this yet — see Open items)
```

`GIProduct` fields actually used by the new frontend:

```json
{
  "id": "mysore-silk",
  "name": { "en": "Mysore Silk", "kn": "..." },
  "category": "Handicrafts Products",
  "image": "https://.../uploads/gi-products/....jpg",
  "video": "https://.../uploads/gi-videos/....mp4",
  "summary": { "en": "...", "kn": "..." }
}
```

`story` also exists on the model (longer "learn more" text) but the admin
form we built doesn't expose it yet — left for a future iteration if the
public page ever needs a bigger product-detail view than the current
image + summary + Enquire card.

`Enquiry` fields sent by the public "Enquire Now" form: `productId` (the
GIProduct slug), `name`, `email`, `phone` (optional), `message`. This maps
1:1 to the existing `Enquiry` model — no change needed there either.

## How `category` is being used (no new collection)

`GIProduct.category` is a free-text string on the model (same pattern as
`Download.category`'s fixed enum, just not enforced at the schema level).
Rather than adding a dedicated `GICategory` collection, the frontend's admin
"Add/Edit GI Product" form offers a curated `<select>`
(`src/constants/giCategories.js`) so new entries stay consistent:

- Featured Products
- Agricultural Products
- Handicrafts Products
- Manufactured Goods
- Food Products

**Update (2026-09-29):** the first 6 test products seeded directly on the
backend used `Handicraft` / `Textile` / `Agriculture` / `Food` and
placeholder image/video paths that didn't correspond to any real uploaded
file (`uploads/gi-products/` and `uploads/gi-videos/` were both empty —
`GET` on any of those URLs 404'd). Since none of the 6 matched the real
reference site's actual content, categories, or images, we deleted all 6
(`DELETE /admin/gi-products/:slug` ×6) and reseeded the real, complete
dataset instead:

**25 real products, one per GI product on the live reference site**, each
with its real name, real category (using the 5 values above exactly, this
time matched to the live site's own grouping — 5 Agricultural, 16
Handicrafts, 3 Manufactured, 1 Food), real short description (verbatim
from the WordPress source's `detailsp2` copy, cross-checked against the
live site), and a **real uploaded image** (from the 25 product photos
already staged in `public/assets/images/gi/product-images/`, uploaded
through the same `multipart/form-data` endpoint the admin form uses, so
they're real files under `uploads/gi-products/`, not placeholder paths).
Seeded via a one-off script against the real admin API — not a DB-level
insert — so it exercises the exact same code path the admin UI does.
Verified live: category tab counts (5/16/3/1), product switching, and
images all render correctly.

No `Featured Products` data was seeded this pass — stays available in the
dropdown for future curation (blocked on the `featured` field request
above).

**Update (2026-09-29): Artisanal Stories — all 5 real craft videos seeded.**
The first pass only found 2 small placeholder-quality clips in the ZIP
export. A second, more complete source tree
(`E:\vtpc-sourcecode-folder\vtpc.karnataka.gov.in\...\wp-content\uploads\2025\07\`)
had the real **5 final production videos**: `GI_Bidriware_Final.mp4`,
`GI_Channapatna-Toys_Final.mp4`, `GI_Ilkal-saree_Final.mp4`,
`GI_Kolhapuri-Chapal_Final.mp4`, `GI_Rosewood-Inlay_Final.mp4` — vertical
9:16 shorts, ~40–60s each. Each was ~98–150MB at ~20 Mbps, over the
`upload.js` 80MB/file limit, so we re-encoded all 5 with the project's
existing `ffmpeg-static` dependency (720px width, CRF 26, 128kbps AAC
audio, `+faststart`) down to 8–12MB each with no visible quality loss,
then uploaded all 5 via `PUT /admin/gi-products/:slug` (`video` field),
replacing the 2 placeholder clips. All verified 200 OK + real playback in
browser. Public "Artisanal Stories" video cards were also changed from a
16:9 crop to `aspect-[9/16]` + `object-contain` to show these vertical
videos uncropped.

If you want `category` enforced server-side later (e.g. a Mongoose
`enum`), the 5 values above are the current complete list — just ping us
before renaming any of them since the frontend still matches on exact
string for the curated ones.

## How the `video` field is reused for Artisanal Stories (no new collection)

The public "Artisanal Stories" section (3-videos-per-row grid, background
image `Artisanal Stories.png`) does **not** introduce a new collection. It
simply queries the same `GET /gi-products` list and filters for entries
where `video` is non-empty — any GI product the admin uploads a craft video
for automatically appears there, using that product's `image` as the video
poster and `summary` as the caption. This is why the admin GI Product form
has an optional "Craft video" upload field in addition to the required
image.

## Open items (not blocking, flagging for awareness)

- 🟡 **No admin UI for viewing `/admin/enquiries` yet.** The endpoint exists
  and works; we just haven't built the admin screen to review incoming
  enquiries. Say the word if you want that prioritized next.
- 🟡 `category` has no server-side enum — see above. Low priority since the
  frontend already constrains it via the dropdown.

## Real content — done

**Update (2026-09-29):** all 25 real GI products are now seeded on the
live backend with real names, categories, descriptions and images — see
above. `Featured Products` (curatorial) and craft videos (Artisanal
Stories) are left for a future pass, same pattern as Offices/Org
Chart/Governing Council in `docs/backend-requests/03-about-page.md`.
