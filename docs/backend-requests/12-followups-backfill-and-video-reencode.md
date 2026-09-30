# Follow-ups from verifying docs 10 and 11

Checked docs 10 (WebP/MP4 optimisation) and 11 (Focus Sector `order`/`icon`)
against the running backend. Both are implemented and the image conversion
works. Three things remain, in priority order.

## 🔴 1. Focus Sector `order` / `icon` are not backfilled in the database

`GET /focus-sectors` currently returns all 8 sectors with `order: 0` and an
empty `icon`. The schema, sort and admin routes are correct — only the
existing data is missing the values.

**Why it didn't apply:** the backfill lives in `src/seed/index.js`
(`backfillFocusSectorOrderAndIcons`), which only runs as part of
`npm run seed`. That script also calls `replaceCollection(...)` on Pages,
Leaders, Districts, Cities and Focus Sectors, so **running the full seed
overwrites anything edited in the admin**. Please don't run it on a
database that has real edits.

**Request:** run only the backfill. Either

- move `backfillFocusSectorOrderAndIcons` into its own script, e.g.
  `src/scripts/backfillFocusSectors.js` + `"backfill:focus-sectors"` in
  `package.json`, and run it once; or
- run this once in `mongosh`:

```js
[
  ["pharmaceutical-biotech", 0, "pill"],
  ["electrical-machinery-equipment", 1, "zap"],
  ["ready-made-garments", 2, "shirt"],
  ["automobile", 3, "car"],
  ["organic-chemicals", 4, "flask"],
  ["aerospace", 5, "rocket"],
  ["optical-and-medical", 6, "eye"],
  ["food-products", 7, "wheat"],
].forEach(([slug, order, icon]) =>
  db.focussectors.updateOne({ slug }, { $set: { order, icon } })
);
```

The script should only `$set` these two fields and touch nothing else.

**Check:** `GET /focus-sectors` returns `order` 0–7 and the `icon` keys
above. The public page and admin list look unchanged (the frontend already
inferred the same icons).

## 🟡 2. Large MP4s are re-encoded on every save

`crud.js` calls `scheduleVideoJobs(Model, doc)` on **every** `update`, and
`shouldSkipMp4` only skips MP4 files ≤ 15 MB
(`env.media.videoSkipMp4MaxBytes`). So an already-optimised MP4 larger than
15 MB is queued for re-encoding each time an editor saves the record — even
for something unrelated like toggling "Featured" or fixing a typo. That
wastes CPU, flips `videoStatus` to `processing`, and re-compresses an
already-compressed video (quality loss).

**Request:** only schedule a conversion when the request actually uploaded a
new video, for example in `crud.js`:

```js
update: asyncHandler(async (req, res) => {
  ...
  const body = incoming(req, { generateSlug: false });
  const uploadedNewVideo = fileKeys.some((key) => body[key] && body[key] !== doc[key]);
  ...
  await doc.save();
  if (uploadedNewVideo) scheduleVideoJobs(Model, doc);
  ...
})
```

(Or compare `body.video` with the previous value — the point is: no new
video in the request → no job.) Optionally also mark a converted file so it
is never re-encoded, e.g. skip when `videoStatus === "ready"` and the
`video` value didn't change.

**Check:** upload a 30 MB video → converts once and ends `ready`. Edit the
same record's name without a video → no ffmpeg job, `videoStatus` stays
`ready`, file unchanged.

## 🟡 3. `ffmpeg` must be installed where the backend runs

Verified on the dev machine: `ffmpeg` is not on the PATH, so no video is
converted — the original file is kept and the record's `videoStatus` becomes
`failed` (the code logs *"ffmpeg is not installed. Original video files will
be kept."* once). That's the intended graceful fallback, but the feature does
nothing until it's installed.

**Request:** install `ffmpeg` on every environment that runs the backend
(dev: e.g. `winget install ffmpeg`; servers: `apt install ffmpeg`), add it
to the deployment notes / README, and restart the backend so it's found.

**Check:** upload a `.mov` in the admin → responds immediately, and shortly
after the record's `video` points at a smaller `.mp4` with `videoStatus:
"ready"`. Then run `npm run optimize:media` once to convert the existing
uploads if wanted.

## Already verified working

- Image → WebP on upload: a 5.9 MB / 3000 px JPEG became 1.2 MB at
  1920 × 1280; a semi-transparent PNG kept its alpha; the original was
  deleted; GIF and WebP were left untouched.
- `order` / `icon` fields exist on the model, and the controller sorts by
  `order`.
