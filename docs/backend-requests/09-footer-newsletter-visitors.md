# Footer: Website Pages, Newsletter sending, Visitor Analytics, Last Updated

Redesigned the public footer (Office Address, Website Pages, Website
Policies, Download Guide, footer logos, disclaimer, visitor count, last
updated) and built the admin screens for all of it. Three things are
genuinely new backend work; one is a two-line addition to something that
already exists.

## ✅ Already confirmed working — no change needed

- **Newsletter subscribe** (`POST /newsletter/subscribe`, `GET
  /admin/newsletter/subscribers`, `/export`) — tested live, dedup works,
  admin list works. The footer's subscribe form and the new admin
  **Newsletter Subscribers** screen both use this as-is.
- **`Page`** (`GET /pages/:slug`, `POST/PUT/DELETE /admin/pages`) — tested
  live. Used this to update the 7 real policy pages already seeded on the
  backend (Privacy Policy, Terms & Conditions, Hyperlinking Policy,
  Copyright Policy, Security Policy, Help, Screen Reader Access) with
  their real content, extracted from the live reference site. See "Real
  content" below.
- **`Office`** — the footer's Office Address block uses the existing
  `GET /offices` (first office = HQ), no change.

## 🔴 New request: `GET /admin/pages` (list)

The only gap in `Page` — `makeCrud(Page, ...)` already returns a `list`
function (`pageController.js` line 6), it's just not exported or routed.
The new admin **Pages** screen (`/admin/pages`) needs it to show the table
of existing pages/edit links.

```diff
 // src/controllers/pageController.js
 module.exports = {
   getBySlug,
+  list: admin.list,
   create: admin.create,
   update: admin.update,
   remove: admin.remove,
 };
```

```diff
 // src/routes/admin.js
+router.get("/pages", page.list);
 router.post("/pages", page.create);
 router.put("/pages/:id", page.update);
 router.delete("/pages/:id", page.remove);
```

That's it — two lines, same pattern every other resource already uses.

## 🔴 New resource: `NewsletterIssue` (monthly archive + send)

The user wants one newsletter issue authored per month, archived, and
sendable to every current subscriber on demand.

```
GET    /admin/newsletter/issues              auth required, list (newest first)
POST   /admin/newsletter/issues               auth required, JSON body — creates a draft
POST   /admin/newsletter/issues/:id/send       auth required — emails every subscriber, marks sent
DELETE /admin/newsletter/issues/:id            auth required — drafts only; block deleting a sent issue
```

```json
{
  "id": "...",
  "subject": "VTPC Newsletter — October 2026",
  "body": "<p>This month at VTPC...</p>",
  "month": 10,
  "year": 2026,
  "sentAt": null,
  "recipientCount": null
}
```

Suggested Mongoose model:

```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const newsletterIssueSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    sentAt: { type: Date, default: null },
    recipientCount: { type: Number, default: null },
  },
  { timestamps: true }
);

apiJson(newsletterIssueSchema);

module.exports = mongoose.model("NewsletterIssue", newsletterIssueSchema);
```

**The `/send` endpoint** is the one piece that needs real infrastructure,
not just a schema: it has to iterate `NewsletterSubscriber.find()` and
actually email each address (subject + body from the issue), then set
`sentAt = new Date()` and `recipientCount`. If there's no SMTP/email
provider wired up in this backend yet, `nodemailer` + any SMTP
credentials (or a transactional-email provider like SES/SendGrid, whatever
this project already has access to for Karnataka govt infra) is the
standard fit — happy to adjust the frontend to whatever shape you land on
here. Send in batches / don't block the request too long if the
subscriber list grows large.

Admin UI already built (`/admin/newsletter-issues`): a form to draft an
issue (month, year, subject, HTML body) and a list of past issues with a
"Send now" button (disabled once sent) showing recipient count and sent
date.

## 🔴 New resource: `SiteVisit` (day-wise visitor counter)

Nothing like this exists anywhere in the backend today (confirmed —
grepped `models/` and `controllers/`). The reference site's footer just
has a hardcoded "Version C60/KRN/1.3" string, not a real counter, so
there's no legacy behavior to match — this is genuinely new.

```
POST /visits/track                    public — increments today's count by 1
GET  /visits/summary                  public — { total } all-time sum, for the footer
GET  /admin/visits/daily?from&to      auth required — [{ date: "2026-10-01", count: 42 }, ...]
```

Suggested Mongoose model — one document per calendar day, incremented
atomically:

```js
const mongoose = require("mongoose");
const { apiJson } = require("./plugins/apiJson");

const siteVisitSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD", server-local or UTC, your call
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

apiJson(siteVisitSchema);
module.exports = mongoose.model("SiteVisit", siteVisitSchema);
```

```js
// controller sketch
const track = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  await SiteVisit.updateOne({ date: today }, { $inc: { count: 1 } }, { upsert: true });
  res.status(204).end();
});

const summary = asyncHandler(async (req, res) => {
  const [{ total } = { total: 0 }] = await SiteVisit.aggregate([
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]);
  res.json({ total });
});

const daily = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) filter.date = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  const rows = await SiteVisit.find(filter).sort({ date: 1 });
  res.json(rows.map((r) => ({ date: r.date, count: r.count })));
});
```

**No auth, no dedup requested** — a plain page-load counter is what the
reference intent describes ("store the count day wise... show as a sum
till date"), not a unique-visitor system. If you'd rather dedupe by
session/IP to avoid one visitor inflating the count on refresh, that's a
reasonable upgrade later; the frontend already only calls `/visits/track`
once per page-load (in the footer, which renders on every route via
`PublicLayout`), so even without dedup it won't be wildly inflated by a
single visitor browsing multiple pages — just not perfectly unique
either. Your call on which behavior the higher-ups actually want.

Admin UI already built (`/admin/visitor-analytics`): a bar chart (day vs.
count) with date-range filters (custom + 7/30/90-day presets) using the
existing `recharts` dependency, plus the all-time total and the
currently-selected range's total as stat tiles.

## 🔴 New endpoint: `GET /last-updated`

Footer shows "Last updated: <date>" reflecting the most recent content
change anywhere in the CMS.

```
GET /last-updated   public
```
```json
{ "updatedAt": "2026-09-30T11:42:00.000Z" }
```

Cheapest real implementation — every model already has `{ timestamps:
true }`, so this is just the max `updatedAt` across the collections that
actually represent visible content (skip internal-only ones like
sessions/admin users):

```js
const MODELS = [Page, GIProduct, Event, Download, HomepageContent, FocusSector, District, Office, StaffMember];

const lastUpdated = asyncHandler(async (req, res) => {
  const dates = await Promise.all(
    MODELS.map((M) => M.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean())
  );
  const max = dates.reduce((latest, d) => (d?.updatedAt > latest ? d.updatedAt : latest), new Date(0));
  res.json({ updatedAt: max });
});
```

No new schema, no writes — just a handful of cheap indexed queries. Add
more models to the list over time as new content types are built; not
critical if one gets missed early on, the date just won't reflect that
one collection's edits yet.

## Real content — done

Updated the 7 real policy pages (already seeded with placeholder text on
the backend) with their real body content, extracted directly from the
live reference site (`https://vtpc.karnataka.gov.in/<slug>/`, cert
expired so fetched with verification disabled): Privacy Policy, Terms &
Conditions, Hyperlinking Policy, Copyright Policy, Security Policy, Help,
Screen Reader Access. Slugs kept matching the live site exactly (had to
explicitly pass `slug` on update — leaving it out lets the backend
re-derive it from the title, which turned `privacy-policies` into
`privacy-policy` since "Privacy Policy" naturally slugifies singular;
worth knowing if this bites anyone else touching `Page` via the API).

Office Address, footer logos (12 real files, real link targets — verified
against `footer.php`), and the "Download Exporters Guide" brochure (now a
static file at `public/assets/pdf/footer/VTPC-Exporters-Guide.pdf`, copied
from the WordPress source, no backend involvement needed for that one)
are all real, no backend changes needed.

## Until the above lands

The footer and all three new admin screens (Pages, Newsletter Issues,
Visitor Analytics) render clean empty/graceful states — verified live —
rather than erroring, so none of this blocks anything else shipping.
