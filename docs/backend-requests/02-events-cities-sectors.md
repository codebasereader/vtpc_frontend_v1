# Events, Cities, Sectors

Rebuilding the public Events page and its admin CRUD to match the real
reference site (domestic/international trade fair calendar with city,
sector, and date-range filters). This needs two brand-new master-data
resources (Cities, Event Sectors) plus a schema change to `Event` itself.
Read directly from `src/models/Event.js`, `src/models/Office.js`,
`src/controllers/resourcesController.js`, `src/routes/admin.js`, and
`src/routes/public.js` — not assumed.

## Confirmed working as-is

Event CRUD routes already exist and need no route changes — only the
`Event` model's shape changes (see below):

```
GET    /events              public, list, sorted by date
GET    /events/:id          public, single
POST   /admin/events        auth required, plain JSON body (no file upload)
PUT    /admin/events/:id    auth required, plain JSON body
DELETE /admin/events/:id    auth required
```

## 🔴 New resource: City

Not a duplicate of `District` — districts are Karnataka's 30
administrative divisions; events happen in cities anywhere in India or
abroad (the real site's international event list includes Nagoya, Milan,
Hannover, Shanghai, etc.), so this needs to be its own simple, flat master
list, independent of the Districts feature.

**`src/models/City.js`** (new file):

```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const citySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },   // e.g. "Uttar Pradesh" — optional
    country: { type: String, default: "India", trim: true },
  },
  { timestamps: true }
);

apiJson(citySchema, { idFrom: "slug" });

module.exports = mongoose.model("City", citySchema);
```

**`src/models/index.js`**: add `City` to the requires and the exports.

**`src/controllers/resourcesController.js`**: add alongside `districts`:

```js
const cities = makeCrud(City, {
  label: "City",
  slugField: "slug",
  slugFrom: "name",
});
```

(and add `cities` to the destructured import from `./models` at the top,
and to `module.exports`)

**`src/routes/public.js`**: add `router.get("/cities", cities.list)`

**`src/routes/admin.js`**: add the same create/update/delete trio used for
districts:

```js
router.post("/cities", cities.create);
router.put("/cities/:id", cities.update);
router.delete("/cities/:id", cities.remove);
```

No file uploads needed — same plain-JSON contract as Districts.

## 🔴 New resource: Event Sector

Deliberately **not** the existing `FocusSector` model — `FocusSector` is a
heavy, content-managed entity for the dedicated sector pages (stat boxes,
yearly charts, top markets). Event tagging needs a lightweight label list
("Machine Tools / Manufacturing", "Food Processing", "Multi Product", as
seen on the real site) that won't have an entry for every `FocusSector`
and shouldn't force one.

**`src/models/EventSector.js`** (new file):

```js
const mongoose = require("mongoose");
const { bilingualSchema } = require("./schemas/common");
const { apiJson } = require("./plugins/apiJson");

const eventSectorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: bilingualSchema, default: () => ({}) },
  },
  { timestamps: true }
);

apiJson(eventSectorSchema, { idFrom: "slug" });

module.exports = mongoose.model("EventSector", eventSectorSchema);
```

Same wiring pattern as City: add to `models/index.js`, add
`eventSectors = makeCrud(EventSector, { label: "Event sector", slugField: "slug", slugFrom: "name.en" })`
in `resourcesController.js`, `GET /event-sectors` in `public.js`,
`POST`/`PUT`/`DELETE /admin/event-sectors` in `admin.js`.

## 🔴 `Event` schema changes

Current shape (`src/models/Event.js`):

```js
{
  title: bilingualSchema,
  date: String,          // free text, e.g. "03-05 Apr 2026" — not filterable/sortable as a real date
  location: bilingualSchema,   // free text, no link to a real place
  description: bilingualSchema,
  registrationLink: String,
}
```

Needed shape — adds domestic/international classification, real
sortable/filterable dates (including a TBA-with-year-only case, seen on
the real site as events like "AAHAR Food & Hospitality Expo — TBC 2027"),
and links to the two new master lists instead of free text:

```diff
  const mongoose = require("mongoose");
  const { bilingualSchema } = require("./schemas/common");
  const { apiJson } = require("./plugins/apiJson");

  const eventSchema = new mongoose.Schema(
    {
      title: { type: bilingualSchema, default: () => ({}) },
-     date: { type: String, required: true, trim: true },
-     location: { type: bilingualSchema, default: () => ({}) },
+     type: { type: String, enum: ["domestic", "international"], required: true },
+     // Stores the City/EventSector *slug* as a plain string, not a Mongoose
+     // ObjectId ref — the frontend already has the full City/EventSector
+     // lists loaded for filter dropdowns, so it resolves the display name
+     // client-side by slug. Keeps this model on the same generic makeCrud
+     // path as everything else (no custom populate() needed).
+     city: { type: String, required: true, trim: true },
+     sector: { type: String, required: true, trim: true },
+     isDateTBA: { type: Boolean, default: false },
+     startDate: { type: Date },   // required unless isDateTBA
+     endDate: { type: Date },     // optional — omit for single-day events
+     tbaYear: { type: Number },   // required when isDateTBA is true, e.g. 2027
      description: { type: bilingualSchema, default: () => ({}) },
      registrationLink: { type: String, default: "" },
    },
    { timestamps: true }
  );

- eventSchema.index({ date: 1 });
+ eventSchema.index({ startDate: 1 });
  apiJson(eventSchema);

  module.exports = mongoose.model("Event", eventSchema);
```

**`src/controllers/resourcesController.js`**: update the existing
`events` sort option to match the renamed field:

```diff
  const events = makeCrud(Event, {
    label: "Event",
-   sort: { date: 1 },
+   sort: { startDate: 1 },
  });
```

Status ("Upcoming" / "Completed", shown as a badge on the real site) is
**not** a stored field — the frontend computes it by comparing
`endDate ?? startDate` against the current date. No backend work needed
for that part.

### Migration note

Existing seeded events have the old `date`/`location` string fields.
Once the schema changes, those documents will have `startDate`/`endDate`
as `undefined` and no `type`/`city`/`sector` — they'll fail the admin
form's validation on next edit (`type`, `city`, `sector` are required) but
won't crash `GET /events` (Mongoose won't reject reading a document just
because required fields are missing on read, only on save). Please run a
one-time data pass converting the old `date` string into real
`startDate`/`endDate` (or `isDateTBA` + `tbaYear`) values, and either
delete the old seeded events or backfill `type`/`city`/`sector` — same
"schedule the migration alongside the schema change" ask as the Leaders
`name` change in `01-leaders.md`.
