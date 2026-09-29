# Backend Requests

This folder tracks anything the frontend needs from the backend
(`vtpc_backend_v1`) — bugs, missing endpoints, shape mismatches — found
while building each page's CMS integration. One file per page/area, added
as we get to it (not all upfront). Share the relevant file(s) with the
backend dev as needed; each item is self-contained.

The full API contract (all endpoints, shapes, auth flow) lives at
[`../backend-api-contract.md`](../backend-api-contract.md) — this folder is
for *specific, actionable requests* found during real integration, not the
general reference.

| File | Covers |
|---|---|
| [`00-shared-infra.md`](./00-shared-infra.md) | Auth/session, CORS, env config — things every page depends on |
| [`01-leaders.md`](./01-leaders.md) | Leaders CRUD — confirmed schema/contract, one open question (should `name` be bilingual?) |
| [`02-events-cities-sectors.md`](./02-events-cities-sectors.md) | Events rebuild — two new master-data resources (Cities, Event Sectors) and an `Event` schema change (type enum, real dates incl. TBA+year, city/sector links) |
| [`03-about-page.md`](./03-about-page.md) | About Us page — `Office`/`StaffMember` confirmed sufficient as-is, no schema changes needed |
| [`04-exporter-corner.md`](./04-exporter-corner.md) | Exporter Corner page — two new resources (`Taluk`, `Warehouse`) for the Warehouse Facilities map/filters; Market Intelligence explicitly deferred (needs its own scoping) |
| [`05-market-intelligence.md`](./05-market-intelligence.md) | Market Intelligence section — three new resources (`StateExport`, `TopProduct`, `CountryProduct`) with real extracted data attached, bulk-replace endpoints instead of per-row CRUD |
| [`06-live-site-data-audit.md`](./06-live-site-data-audit.md) | Audit of the live site for Focus Sectors / Warehouse Facilities / Market Intelligence — corrected 4 wrong FocusSector entries to the real 8, confirmed Warehouse Facilities has no real data anywhere, confirmed Market Intelligence already matches |
| [`07-gi-treasures.md`](./07-gi-treasures.md) | Karnataka GI Treasures + Artisanal Stories — `GIProduct`/`Enquiry` confirmed sufficient, real 25-product dataset + craft videos seeded, one new `featured` boolean field requested and added |

Status legend: 🔴 blocking · 🟡 should fix · 🟢 fixed / confirmed working
