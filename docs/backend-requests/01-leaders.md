# Leaders

Admin CRUD for the homepage's CM/Dy. CM/Minister carousel. Built and
verified against the real API (`vtpc_backend_v1`, read-only reference —
everything below documents what's already confirmed working, plus one
schema change needed for `name`, see below).

## Confirmed working as-is

Read directly from `src/models/Leader.js`, `src/controllers/resourcesController.js`,
`src/routes/public.js`, and `src/routes/admin.js` — not assumed.

```
GET    /leaders              public, list, sorted by order
POST   /admin/leaders        auth required, multipart/form-data
PUT    /admin/leaders/:id    auth required, multipart/form-data
DELETE /admin/leaders/:id    auth required
```

Schema (target shape — `name` is still a plain string on the live backend
today; see the 🔴 request below for the change needed):

```js
{
  id: string,               // Mongo _id
  name: { en: string, kn: string },
  designation: { en: string, kn: string },
  photo: string,              // absolute URL once PUBLIC_BASE_URL is fixed (see 00-shared-infra.md)
  order: number,
}
```

**Multipart contract**, confirmed by reading `parseBody.js` /
`upload.js`: nested fields go as `designation[en]` / `designation[kn]`
(bracket notation), and the photo file must be sent under the field name
`photo` (matches `fileFields: { photo: 'leaders' }` in
`resourcesController.js`). Update requests that don't include a new
`photo` file leave the existing photo untouched — confirmed by reading
`crud.js`'s `update` handler (only overwrites fields actually present in
the parsed body). The admin form relies on this: editing a leader without
picking a new photo sends no `photo` field at all.

## 🔴 `name` needs to become bilingual, matching `designation`

Confirmed requirement (not just a question anymore): leaders need a
Kannada name too (e.g. "ಸಿದ್ದರಾಮಯ್ಯ" for Siddaramaiah), not just a Kannada
title. **The frontend has already been updated** to send/expect
`name: { en, kn }` — the admin form now has separate "Name (English)" and
"Name (Kannada)" fields, both required, and `POST`/`PUT /admin/leaders`
now send `name[en]` / `name[kn]` instead of a plain `name` field.

**This means creating/editing a leader will currently fail** against the
live backend — `Leader.name` is still `{ type: String }`, so Mongoose will
reject (or mis-cast) the incoming object. **Ask:** update
`src/models/Leader.js`:

```diff
  const leaderSchema = new mongoose.Schema(
    {
-     name: { type: String, required: true, trim: true },
+     name: { type: bilingualSchema, default: () => ({}) },
      designation: { type: bilingualSchema, default: () => ({}) },
```

**Existing seeded leaders** (Siddaramaiah/Shivakumar/Patil) have `name` as
a plain string today — those documents will need a one-time data fix to
`{ en: "<existing value>", kn: "" }` once the schema changes, or `GET
/leaders` will return the old string shape mixed with the new object shape
depending on which record. The frontend list view already handles both
shapes defensively in the meantime (reads `.en` if `name` is an object,
falls back to the raw string otherwise) so nothing breaks while this is in
flight — but please schedule the data migration alongside the schema
change, not as an afterthought.
