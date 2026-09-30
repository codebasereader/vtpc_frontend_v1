# Newsletter: PDF attachment, subscriber dates, sent archive

The admin **Send Newsletter** page now pre-fills the subject and message,
lets the editor attach a **PDF**, and requires an explicit confirmation
before sending. There is a separate **Sent Newsletters** page (archive of
sent issues with search, year and date-range filters and a view drawer), and
the **Newsletter Subscribers** page has search plus a subscribed-date range.

Search and filters on all other admin lists (Events upcoming/completed +
date range, Cities, Event Sectors, Districts, Governing Council, GI
Products, Download Categories, Downloads, Pages) are done **client-side**
on the data the lists already load — **no backend change needed for them**.

Two things below do need the backend.

## 🔴 1. `GET /admin/newsletter/subscribers` must return `createdAt` (and `id`)

**Today** (`newsletterController.list`):

```js
res.json(rows.map((row) => ({ email: row.email })));
```

Only `email` is returned, so the subscribers screen can't show or filter by
"subscribed on" — the column shows "—" and the date-range filter is hidden
(it shows "Date filters appear once the server returns subscription
dates"). The CSV export endpoint already has `createdAt`; the list just
doesn't include it.

**Request:** return the same shape as other resources:

```js
res.json(rows.map((row) => ({
  id: row._id,
  email: row.email,
  createdAt: row.createdAt,   // ISO string
})));
```

No frontend change is needed afterwards — the date filter, the "Subscribed
on" column and the filtered CSV export switch on automatically.

*(Optional, later, if the list grows into the thousands: support
`?q=<email fragment>&from=<yyyy-mm-dd>&to=<yyyy-mm-dd>&page=&limit=` and
return `{ items, total }`. The UI currently filters in the browser.)*

## 🔴 2. Newsletter issue **PDF attachment**

The compose form sends `POST /admin/newsletter/issues` as **multipart**
when a PDF is attached (plain JSON when not, so today's backend keeps
working for drafts without a PDF):

| Field | Type | Notes |
|---|---|---|
| `subject` | string | as today |
| `body` | string (HTML) | as today |
| `month` | number 1–12 | as today |
| `year` | number | as today |
| `attachment` | file (`application/pdf`) | **new**, optional |

**Requested changes**

1. **Model** `NewsletterIssue`: add
   ```js
   attachment: { type: String, default: "" },      // public URL/path of the stored PDF
   attachmentName: { type: String, default: "" },  // original file name, shown in the admin
   ```
2. **Route** `POST /admin/newsletter/issues`: add
   `setUploadFolders({ attachment: "newsletters" })` + `upload.any()` before
   `newsletterIssues.create`; add `"newsletters"` to `FOLDERS` in
   `src/utils/upload.js`. Accept **only** `application/pdf` for this field
   and cap it at **10 MB** (the frontend enforces the same; the global
   limit is 80 MB). The create handler stores `attachment` (via
   `applyUploadedFiles`/`publicPathFor`) and `attachmentName`
   (`file.originalname`). Keep `parseRequestBody`, since multipart sends
   `month`/`year` as strings — cast with `Number(...)`.
   Do **not** run `optimizeUploadedImages` on this route.
3. **Sending** (`newsletterIssueController.send` + `mailer.sendHtmlMailBatch`):
   attach the PDF to every email using nodemailer's `attachments`:
   ```js
   attachments: issue.attachment
     ? [{ filename: issue.attachmentName || "newsletter.pdf", path: absoluteDiskPath }]
     : []
   ```
   (`path` = the file on disk under `uploads/newsletters/`.) Extend
   `sendHtmlMailBatch(recipients, { subject, html, attachments })`.
   If the file is missing on disk, fail the send with a clear 4xx/5xx
   message rather than sending without it.
4. **`GET /admin/newsletter/issues`** must return `attachment` and
   `attachmentName` (they will once they're on the schema). The frontend
   shows a paperclip + file name on drafts and a "PDF" tag/"Open PDF" link
   on sent issues.
5. **Delete:** when a draft is deleted, delete its PDF from disk
   (`deleteLocal`).

**Checks**

- Save a draft with a PDF → the draft row shows the file name; "Open PDF"
  works in its detail drawer.
- Send it → a test subscriber receives the email **with the PDF attached**
  and the pre-filled HTML body.
- Save a draft **without** a PDF → still works exactly as before.
- Upload a `.docx`/image or a >10 MB PDF → rejected with a clear message.

## 🟡 3. Sent archive (no new endpoint required)

The **Sent Newsletters** page reads `GET /admin/newsletter/issues` and keeps
issues where `sentAt` is set, so nothing is strictly required. Recommended
small additions, in priority order:

- Keep returning `sentAt` and `recipientCount` (already there) — the page
  shows both.
- *(Nice to have)* `sentBy` (admin name/email) on the issue, set in `send`,
  so the archive can show who sent it.
- *(Nice to have)* `?status=sent|draft` filter on the issues list so the two
  pages don't download everything.
- *(Recommended)* `send` currently emails every subscriber **inside the
  request** (batches of 25). With a large list the request will time out
  while emails are still going out. Consider marking the issue
  `status: "sending"` and processing in the background (same in-process
  queue idea as video optimisation), then setting `sentAt`/`recipientCount`
  when done. The frontend would then only need to show a "Sending…" state.

## Already verified working (no change)

- Subscribing from the footer (`POST /newsletter/subscribe`), including
  dedup.
- Create/list/send/delete of issues without an attachment.
