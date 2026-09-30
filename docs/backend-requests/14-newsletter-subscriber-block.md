# Newsletter subscribers: block / unblock + return subscription date

The admin **Newsletter Subscribers** screen now has an Active / Blocked
status per subscriber. A subscriber is **active by default**; an admin can
toggle one to **blocked** (with a confirmation dialog). Blocked subscribers
stay on the list but must **not receive newsletters**. The screen has
All / Active / Blocked filter tabs with counts, alongside search and a
subscribed-date range.

This needs backend work in four places. (Item 1 repeats the still-open
request from doc 13 — the subscribers list still returns only `email`, so the
"Subscribed on" column shows "—".)

## 🔴 1. Return `id` and `createdAt` (and `status`) from the subscribers list

`GET /admin/newsletter/subscribers` currently returns:

```json
[{ "email": "someone@example.com" }]
```

Please return:

```js
res.json(rows.map((row) => ({
  id: row._id,
  email: row.email,
  status: row.status,        // "active" | "blocked"
  createdAt: row.createdAt,  // ISO string  → fills "Subscribed on" + the date filter
})));
```

Without `id` the block toggle can't address the record (the UI shows
*"The server did not return an id for this subscriber…"*); without
`createdAt` the "Subscribed on" column stays "—" and the date-range filter is
hidden.

## 🔴 2. `status` field on `NewsletterSubscriber`

```js
status: { type: String, enum: ["active", "blocked"], default: "active" },
```

- Default is **active**, so every existing subscriber stays active — no
  data migration is strictly needed (a missing `status` is treated as
  `"active"` by both frontend and backend). Optionally backfill:
  `db.newslettersubscribers.updateMany({ status: { $exists: false } }, { $set: { status: "active" } })`.
- Optional: add `blockedAt: Date` (set when blocked, cleared when
  unblocked) for the audit trail.

## 🔴 3. New endpoint to change status

```
PATCH /admin/newsletter/subscribers/:id
body: { "status": "active" | "blocked" }
→ 200 { id, email, status, createdAt }
```

- `requireAuth` like the other admin routes.
- Validate `status` is one of the two values (400 otherwise); 404 if the id
  doesn't exist.
- Only `status` is editable here.

## 🔴 4. Blocked subscribers must not receive newsletters

In `newsletterIssueController.send`, only email **active** subscribers:

```js
const subscribers = await NewsletterSubscriber
  .find({ status: { $ne: "blocked" } })   // $ne so legacy docs with no status still get mail
  .select("email")
  .lean();
```

`recipientCount` should therefore be the number of **active** subscribers
the mail was sent to (the Sent Newsletters page shows this number).

Also consider the public footer form, `POST /newsletter/subscribe`: if the
email already exists **and is blocked**, it must **not** be flipped back to
active. It should just return success (same 200 response as any existing
email) so the visitor isn't told they're blocked. Only an admin can unblock.

## 🟡 5. CSV export

`GET /admin/newsletter/subscribers/export` should include a `status` column
(`email,status,subscribedAt`). The admin's "Export CSV" button now builds its
own CSV in the browser from what is on screen (including status), so this is
only needed if the server export is used elsewhere.

## Checks

- Existing subscribers all show **Active**; counts on the tabs add up.
- Toggle one off → confirmation dialog → **Block subscriber** → row shows
  *Blocked*, moves to the Blocked tab, and the Active count drops by one.
- Send a newsletter → the blocked address receives nothing; the sent
  issue's recipient count equals the number of active subscribers.
- The blocked person submits the footer form again → still blocked.
- Toggle back on (no confirmation needed) → active again and included in the
  next send.
- The "Subscribed on" column now shows real dates and the "Subscribed
  from/to" filter appears.
