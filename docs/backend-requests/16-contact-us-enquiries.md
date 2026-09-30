# Contact Us enquiries (floating "Contact Us" button)

The floating **Contact Us** button on the public site no longer navigates to
`/contact`; it opens a modal with **Name, Email, Phone (optional) and
Enquiry**. Submissions are listed in a new admin page **Contact Enquiries**
(`/admin/contact-enquiries`, sidebar → *Site & Newsletter*) with newest-first
sort, search, status tabs (All / Pending / Contacted), a received-date range,
a **Mark as contacted** button (with Undo), a detail drawer and CSV export.

It uses the same UI as **GI Enquiries** (doc 15). There is **no backend for it
yet** — please add the resource below. Until then the public form shows its
"Something went wrong" message and the admin page shows an error.

## 🔴 1. New model `ContactEnquiry`

```js
// models/ContactEnquiry.js
const contactEnquirySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 120 },
    email:       { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone:       { type: String, default: "", trim: true, maxlength: 30 },
    message:     { type: String, required: true, trim: true, maxlength: 2000 },
    contacted:   { type: Boolean, default: false },
    contactedAt: { type: Date, default: null },
    contactedBy: { type: String, default: "" },   // "Name <email>" of the admin
  },
  { timestamps: true }
);
contactEnquirySchema.index({ createdAt: -1 });
apiJson(contactEnquirySchema, { keepTimestamps: true });
```

Register it in `models/index.js`. Same shape as `Enquiry`, minus
`productId`/`productName`. The JSON returned to the admin must include
`id, name, email, phone, message, contacted, contactedAt, contactedBy,
createdAt, updatedAt`.

## 🔴 2. Public endpoint

```
POST /contact-enquiries        (public, behind publicWriteLimiter like /enquiries)
body: { name, email, phone?, message }
→ 201 { "message": "Enquiry received" }
```

Validation (400 with `{ message }` otherwise — the form shows a generic
error, and does client-side checks first):

- `name`, `email`, `message` required and non-empty after trimming
- `email` must look like an email (`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- `phone` optional; if present, 7–20 characters of digits, spaces, `+`, `(`,
  `)`, `-`
- `message` ≤ 2000 characters, `name` ≤ 120

The form also contains a hidden **honeypot** field (`website`) that the
frontend never sends when it's filled, so no server handling is needed — but
the rate limiter should stay on this route since it is public and unauthenticated.

## 🔴 3. Admin endpoints

```
GET   /admin/contact-enquiries        → [ ...enquiries ]  sorted by createdAt DESC
PATCH /admin/contact-enquiries/:id    body { "contacted": true | false } → updated enquiry
```

Both behind `requireAuth`, mirroring `GET/PATCH /admin/enquiries`
(`enquiryController.list` / `updateContacted`):

- `PATCH`: 400 if `contacted` isn't a boolean; 404 if the id doesn't exist.
- `contacted: true` → set `contactedAt = now` and `contactedBy` from the
  logged-in user; `contacted: false` → clear both (this is the **Undo**
  button).
- Nothing else is editable through this route (name, email, phone, message
  stay immutable).

## 🟡 4. Recommended

- **Email notification** to an admin inbox on each new contact enquiry (the
  SMTP mailer already exists), so messages aren't missed. Address in an env
  var, e.g. `CONTACT_NOTIFY_EMAIL`. Fail silently (log) if mail isn't
  configured — never fail the visitor's submission because of it.
- **Basic abuse protection** beyond the rate limiter: reject obvious
  duplicates (same email + same message within a few minutes).

## 🟢 5. Optional / later

- Server-side filtering/paging (`?status=&from=&to=&q=&page=&limit=` returning
  `{ items, total }`) when volume grows — the UI currently loads all rows and
  filters in the browser, like GI Enquiries.
- Internal `adminNote` field for follow-up comments.

## Checks

- Click **Contact Us** on any public page → modal opens; submitting an empty
  form shows field errors; a valid submit shows a "Thank you" state.
- The enquiry appears at the top of **Admin → Contact Enquiries** with a
  "New" badge.
- **Mark as contacted** → card turns green with today's date and survives a
  refresh; **Undo** returns it to pending.
- Search, the date range, the status tabs and *Export CSV* (all / current
  filtered results) behave as on GI Enquiries.
- Submitting rapidly from one IP hits the rate limiter (429).
