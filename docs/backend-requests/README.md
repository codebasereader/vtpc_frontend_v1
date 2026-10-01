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
| [`08-downloads.md`](./08-downloads.md) | Downloads page — new `DownloadCategory` resource, `Download.category` changed from a fixed enum to a free reference, new `parent`/`order` fields for two-level nested documents |
| [`09-footer-newsletter-visitors.md`](./09-footer-newsletter-visitors.md) | Footer redesign — `GET /admin/pages` list route, new `NewsletterIssue` (monthly archive + send) and `SiteVisit` (day-wise counter) resources, new `GET /last-updated` endpoint |
| [`10-media-optimisation.md`](./10-media-optimisation.md) | Auto-convert uploaded images to WebP (sharp) and videos to MP4/H.264 (ffmpeg, background job) — rules, settings, acceptance checks |
| [`11-focus-sectors-order-icon.md`](./11-focus-sectors-order-icon.md) | Focus Sectors — new `order` (number, sort) and `icon` (string) fields so editors can reorder sectors and pick each tab icon |
| [`12-followups-backfill-and-video-reencode.md`](./12-followups-backfill-and-video-reencode.md) | Follow-ups after verifying docs 10/11 — run only the focus-sector `order`/`icon` backfill (not the full seed), stop re-encoding large MP4s on every save, install ffmpeg |
| [`13-newsletter-attachment-and-subscriber-dates.md`](./13-newsletter-attachment-and-subscriber-dates.md) | Newsletter — PDF attachment on issues (multipart create + attach on send), `createdAt` on the subscribers list, sent-archive notes; list search/date filters are client-side, no backend work |
| [`14-newsletter-subscriber-block.md`](./14-newsletter-subscriber-block.md) | Newsletter subscribers — `status` (active/blocked) field + `PATCH` endpoint, skip blocked on send, return `id`/`createdAt` in the list (fixes the empty "Subscribed on" column) |
| [`15-gi-enquiries-admin.md`](./15-gi-enquiries-admin.md) | GI Enquiries admin screen — `contacted`/`contactedAt`/`contactedBy` on `Enquiry` + `PATCH /admin/enquiries/:id`, product-name snapshot, validation; list/filters/export are client-side on the existing `GET /admin/enquiries` |
| [`16-contact-us-enquiries.md`](./16-contact-us-enquiries.md) | Contact Us modal + admin Contact Enquiries — new `ContactEnquiry` model, public `POST /contact-enquiries`, admin list + `PATCH` contacted (same shape as GI enquiries) |
| [`17-forms-registrations-feedback.md`](./17-forms-registrations-feedback.md) | Forms builder + home marquee — `Form`/`FormResponse` models, public `GET /forms/active`, `GET /forms/:slug`, `POST /forms/:slug/responses`, admin CRUD/toggle/responses/delete with server-side answer validation |
| [`18-roles-users-access-audit.md`](./18-roles-users-access-audit.md) | Roles, users, role-based page access (server-enforced, default-deny) and Super-Admin-only audit logs — login/logout sessions, every change with before/after, failed logins, access denied |

Status legend: 🔴 blocking · 🟡 should fix · 🟢 fixed / confirmed working
