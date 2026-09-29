# About Us page

Building the public About Us page (hero, vision/mission, what we do,
organization chart, governing council, "Where to find us" offices) plus
admin CRUD for the org chart, governing council, and offices. Read
directly from `src/models/Office.js` and `src/models/StaffMember.js` on
the real backend before writing this — not assumed.

## Confirmed working as-is — no schema or route changes needed

Both collections this page needs already exist on the live backend with
exactly the shape the frontend needs. Verified against
`GET http://localhost:4200/offices` and `GET http://localhost:4200/staff`
returning real (if currently dummy) data.

```
GET    /offices              public, list
POST   /admin/offices        auth required, JSON body
PUT    /admin/offices/:id    auth required, JSON body
DELETE /admin/offices/:id    auth required

GET    /staff                public, list (frontend filters by `group` client-side)
POST   /admin/staff          auth required, multipart/form-data (photo upload)
PUT    /admin/staff/:id      auth required, multipart/form-data
DELETE /admin/staff/:id      auth required
```

`Office` shape used as-is: `{ id, name, city, address: {en, kn}, phone, email, mapLink }`.

`StaffMember` shape used as-is: `{ id, name, role, group: 'org-chart' | 'governing-council', order, photo }`.

## How the frontend uses these fields (informational, not a request)

- **Organization chart** (`group: 'org-chart'`) has no parent/tree field
  in the schema, and none was requested — the chart is a fixed 5-slot
  shape (Chairman → Managing Director → Joint Director, then the Joint
  Director branches into two siblings). The frontend renders this purely
  from `order`: `order` 1–3 form the vertical chain, `order` ≥ 4 render as
  siblings under the Joint Director. Adding a 4th sibling later just means
  giving it `order: 5`.
- The multi-line department/ministry text under each org-chart role (e.g.
  "Industries Commissioner / Department of Industries & Commerce /
  Government of Karnataka") is stored as newline-separated text in the
  existing `role` field — rendered with `white-space: pre-line`. No new
  field needed.
- **Governing council** (`group: 'governing-council'`) maps `order` →
  Sl.No., `name` → Member, `role` → Designation. `photo` is unused for
  this group (the reference table has no photos).
- **Offices**: the reference site's real 5 regional offices (Bengaluru HQ,
  Dharwad, Mysuru, Kalaburagi, Mangaluru) have no `photo` field in the
  schema and none was requested — the About page uses a single combined
  Karnataka-map graphic instead of per-office building photos.

## Not a request — a heads-up

The live backend's `/offices` and `/staff` currently hold placeholder
seed rows (3 generic offices, 5 generic staff names with stock photos).
The client is replacing these directly through the new admin CRUD
screens this page ships with (Offices, Org Chart, Governing Council under
Admin → Organisation) — no seed-data change needed from your side.
