# Exporter Corner page

Building the public Exporter Corner page (hero, Warehouse Facilities with
district/taluk search + map, Focus Sectors tabs) plus admin CRUD for two
brand-new master-data resources this page needs: **Taluk** and
**Warehouse**. Neither exists on the real backend yet — confirmed via
`GET /taluks` and `GET /warehouses` both returning 404.

**Market Intelligence is intentionally out of scope for this doc.** The
real reference site's Market Intelligence section (`exporter-corner.php`)
turned out to be a full 3-tab trade-data explorer — ~201 product rows
(with HS codes) and ~75 state/country rows of real export-value data,
each tab with year/multi-select filters, search, and a chart. That's a
dataset + filter engine, not a CMS content type, and needs its own
scoping/design pass (likely a bulk-import workflow, not one-row-at-a-time
admin forms). Deferred to a follow-up.

## 🔴 New resource: Taluk

Simple master list, scoped to a district — same shape convention as
`District` (see `docs/backend-api-contract.md`), but taluks don't need a
fixed external slug the way districts do (nothing outside this feature
looks them up by a stable id), so a normal Mongo `_id` is fine.

```
GET    /taluks              public, list
POST   /admin/taluks        auth required, JSON body
PUT    /admin/taluks/:id    auth required, JSON body
DELETE /admin/taluks/:id    auth required
```
```json
{ "id": "...", "name": "Chincholi", "district": "kalaburagi" }
```
`district` stores the existing `District.id` slug (e.g. `"kalaburagi"`),
not a Mongo ref — same pattern `Event.city`/`Event.sector` already use
for `City`/`EventSector` per `docs/backend-requests/02-events-cities-sectors.md`.

Suggested Mongoose model:
```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const talukSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true }, // District.id slug
  },
  { timestamps: true }
);

talukSchema.index({ district: 1 });
apiJson(talukSchema);

module.exports = mongoose.model("Taluk", talukSchema);
```

## 🔴 New resource: Warehouse

Export/bonded warehouse facilities, shown as pins on a Leaflet/OpenStreetMap
map plus a filterable card list (search by name, filter by district then
taluk) on the Exporter Corner page.

```
GET    /warehouses              public, list
POST   /admin/warehouses        auth required, JSON body
PUT    /admin/warehouses/:id    auth required, JSON body
DELETE /admin/warehouses/:id    auth required
```
```json
{
  "id": "...",
  "name": "VTPC Export Warehouse - Kalaburagi",
  "district": "kalaburagi",
  "taluk": "<Taluk _id, or omitted/empty if not set>",
  "capacityMt": 5000,
  "lat": 17.3297,
  "lng": 76.8343,
  "address": ""
}
```
`lat`/`lng` are optional (nullable) — the admin form allows saving a
warehouse without exact coordinates yet; the frontend just skips the map
pin for those and still lists it in search results. `taluk` references
`Taluk._id` (a string), not the taluk name, since taluk names aren't
guaranteed unique across districts.

Suggested Mongoose model:
```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true }, // District.id slug
    taluk: { type: String, default: "" }, // Taluk._id
    capacityMt: { type: Number, default: 0 },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);

warehouseSchema.index({ district: 1, taluk: 1 });
apiJson(warehouseSchema);

module.exports = mongoose.model("Warehouse", warehouseSchema);
```

## Confirmed working as-is — no changes needed

`FocusSector` (`GET /focus-sectors`) already has everything the new
"Focus Sectors of Karnataka" horizontal-tab section needs —
`name`, `image`, `description`, `keyInsights`, `statBoxes`, `topMarkets`,
`yearlyChart` — and already has real seed data (4 sectors: Pharmaceutical
& Biotech, IT & ITeS, Tourism & Hospitality, Engineering & Auto
Components). No request here; just noting it for the record since this
page is the first to consume it beyond the admin dashboard placeholder.

`District` (`GET /districts`) is used as-is for the Warehouse district
filter dropdown — no changes.
