# Market Intelligence (Exporter Corner)

> **Superseded by [19-market-data-releases.md](./19-market-data-releases.md).** The real DGCIS/RBI workbooks
> (US$ million, district / sector / state level, uploaded by staff every quarter) replaced this static
> dataset. The frontend no longer calls the three endpoints below.

Three new backend collections for the Exporter Corner "Market
Intelligence" section — a 3-tab trade-data explorer (Key States, Top
Products, Key Countries). All three datasets are **real data extracted
directly from the live reference site's own source** (`ProductsList.json`
and embedded data attributes in
`wp-content/themes/VTPC/template/exporter-corner.php`), not placeholder —
attached below as ready-to-import JSON files so nobody has to retype
~3,340 rows by hand.

None of these three endpoints exist yet — confirmed 404 before writing
this request.

## Why bulk endpoints, not per-row CRUD

`CountryProduct` alone is 3,200 rows. One-row-at-a-time admin forms
(the pattern used for every other collection in this project) don't fit
this data — it's a periodically-refreshed trade dataset, not
hand-authored content. Each collection below gets a single **bulk
replace** endpoint instead of `POST`/`PUT`/`DELETE` per row: upload the
full new dataset, it replaces the collection wholesale. That matches how
this data will actually be maintained (a new figures release once or
twice a year, not individual edits).

## 🔴 New resource: StateExport

Karnataka vs. other Indian states, by fiscal year. Values in ₹ Crore.

```
GET  /state-exports                       public, list
POST /admin/state-exports/bulk-replace    auth required, JSON array body — replaces the whole collection
```
```json
{
  "id": "...",
  "slug": "karnataka",
  "name": "Karnataka",
  "code": "KA",
  "color": "#FFA723",
  "exports": {
    "FY 2020-2021": 26630.50,
    "FY 2021-2022": 27937.46,
    "FY 2022-2023": 25874.50,
    "FY 2023-2024": 15140.41
  }
}
```
Real data (38 states/UTs incl. Karnataka) attached at
[`data/market-intelligence/state-exports.json`](./data/market-intelligence/state-exports.json)
— import as-is, field names already match.

Suggested Mongoose model:
```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const stateExportSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "" },
    color: { type: String, default: "" },
    exports: { type: Map, of: Number, default: {} }, // key = "FY 2020-2021" etc.
  },
  { timestamps: true }
);

apiJson(stateExportSchema);
module.exports = mongoose.model("StateExport", stateExportSchema);
```

## 🔴 New resource: TopProduct

Karnataka's top exported products by HS code, by fiscal year. Values in
₹ Crore.

```
GET  /top-products                       public, list
POST /admin/top-products/bulk-replace    auth required, JSON array body
```
```json
{
  "id": "...",
  "hsCode": "85171300",
  "productName": "Smartphones",
  "color": "#FF7043",
  "exports": {
    "FY 2020-2021": 0,
    "FY 2021-2022": 0,
    "FY 2022-2023": 1909.52,
    "FY 2023-2024": 2226.39
  }
}
```
Real data (100 products) attached at
[`data/market-intelligence/top-products.json`](./data/market-intelligence/top-products.json).

Suggested Mongoose model: same shape as `StateExport` but keyed by
`hsCode` instead of `slug` (`hsCode` unique, plus `productName`, `color`,
`exports` map).

## 🔴 New resource: CountryProduct

Karnataka's exports broken down by destination country and product —
used for the "Key Countries" tab (pick a country, see its top products).

```
GET  /country-products                       public, list
POST /admin/country-products/bulk-replace    auth required, JSON array body
```
```json
{ "id": "...", "country": "USA", "productName": "Smartphones", "hsCode": "85171300", "value": 1114060421 }
```
Real data (3,200 rows, 32 countries) attached at
[`data/market-intelligence/country-products.json`](./data/market-intelligence/country-products.json).

🟡 **Open question:** `value`'s unit isn't confirmed — the source site
never labels it, and the magnitude doesn't obviously match either ₹ Cr
(too large) or raw USD (plausible but unverified) the way the other two
datasets' units are self-evident. The frontend renders these as
**relative, unlabeled bars** (no currency shown) until this is confirmed
— please confirm the real unit so the UI can add a proper axis label.

Suggested Mongoose model:
```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const countryProductSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    hsCode: { type: String, default: "" },
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

countryProductSchema.index({ country: 1 });
apiJson(countryProductSchema);
module.exports = mongoose.model("CountryProduct", countryProductSchema);
```

## Not in this request

No admin UI is being built yet for uploading/replacing these datasets —
that's blocked on the bulk-replace endpoints existing first. Once they're
live, a simple "upload JSON, replace dataset" admin screen is a small
follow-up.
