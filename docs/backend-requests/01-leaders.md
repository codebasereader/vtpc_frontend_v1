# Leaders

Admin CRUD for the homepage's CM/Dy. CM/Minister carousel. Built and
verified against the real API (`vtpc_backend_v1`, read-only reference —
everything below documents what's already confirmed working, plus one
open question).

## Confirmed working as-is

Read directly from `src/models/Leader.js`, `src/controllers/resourcesController.js`,
`src/routes/public.js`, and `src/routes/admin.js` — not assumed.

```
GET    /leaders              public, list, sorted by order
POST   /admin/leaders        auth required, multipart/form-data
PUT    /admin/leaders/:id    auth required, multipart/form-data
DELETE /admin/leaders/:id    auth required
```

Schema:

```js
{
  id: string,               // Mongo _id
  name: string,              // plain string — see open question below
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

## 🟡 Open question: should `name` be bilingual too?

Every other text field on `Leader` is `{en, kn}`, but `name` is a plain
string. For a fully bilingual site, a leader's name likely needs a Kannada
rendering too (e.g. "ಸಿದ್ದರಾಮಯ್ಯ" for Siddaramaiah), not just their title.

**Ask:** confirm whether `name` should become `{ en: String, kn: String }`
to match `designation`. If yes, the frontend form and API payload will
need `name[en]`/`name[kn]` fields added — a small, contained change on
both sides. Not blocking — the current CRUD works fully against the
existing schema; this is a content-completeness question, not a bug.
