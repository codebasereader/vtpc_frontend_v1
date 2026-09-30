# Focus Sectors: display `order` and tab `icon`

The Exporter Corner → "Focus Sectors of Karnataka" section is API-driven
(`GET /focus-sectors`), and the admin now has a full **Focus Sectors** CRUD
(list, add, edit, delete — `POST/PUT/DELETE /admin/focus-sectors`, all of
which already worked, no change needed). Two small things are missing on
the backend so editors can control how the section looks.

## 🔴 1. `order` field (number) — sector display order

**Problem:** `GET /focus-sectors` returns sectors in insertion order
(`makeCrud(FocusSector, ...)` has no `sort`). Editors can't reorder them,
and a newly added sector always lands last.

**Request**

- Add to `models/FocusSector.js`:
  ```js
  order: { type: Number, default: 0 },
  ```
- Add `sort: { order: 1 }` to the `focusSectors` `makeCrud` options in
  `resourcesController.js` so `GET /focus-sectors` returns them ordered
  (same pattern as `leaders`, `staff`, `downloadCategories`).
- Backfill the 8 existing sectors so today's order is kept, e.g. in the
  order they currently appear: `0, 1, 2 … 7`. (Untouched documents would
  all default to `0`; ties keep insertion order, so nothing breaks, but
  backfilling makes the admin numbers meaningful.)

The frontend sends `order` as a form field on create/update (`order` is a
plain number string in the multipart body) and also sorts client-side
(missing `order` → last), so it works before and after this change.

## 🔴 2. `icon` field (string) — tab icon

**Problem:** the public tab icon is currently chosen by a hard-coded
slug→icon map in the frontend. A newly added sector always gets a generic
icon. The admin form now has an icon picker.

**Request**

- Add to `models/FocusSector.js`:
  ```js
  icon: { type: String, default: "" },
  ```
- No validation against a list is required (the frontend falls back to a
  generic icon for an empty or unknown key), but if you want one, the
  allowed keys are:

  `pill`, `zap`, `shirt`, `car`, `flask`, `rocket`, `eye`, `wheat`, `cpu`,
  `factory`, `gem`, `plane`, `cog`, `leaf`, `coffee`, `hammer`, `truck`,
  `layers`

- Optional backfill of the 8 existing sectors so their icons are stored
  rather than inferred:

  | slug | icon |
  |---|---|
  | `pharmaceutical-biotech` | `pill` |
  | `electrical-machinery-equipment` | `zap` |
  | `ready-made-garments` | `shirt` |
  | `automobile` | `car` |
  | `organic-chemicals` | `flask` |
  | `aerospace` | `rocket` |
  | `optical-and-medical` | `eye` |
  | `food-products` | `wheat` |

  Until this is backfilled the frontend infers the icon from the slug for
  these eight, so nothing looks different.

Both fields must be returned by `GET /focus-sectors` (they will be, once
they're on the schema, as `order` and `icon`) and accepted by the admin
create/update routes (they go through `parseRequestBody`, which already
handles them).

## Acceptance checks

- Change a sector's **Display order** in the admin → the public tabs and the
  admin list reorder accordingly after refresh.
- Add a new sector with the **Aerospace** icon → its tab shows the rocket
  icon rather than the generic layers icon.
- Existing sectors look and order the same as before the change.
