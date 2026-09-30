# Media optimisation: auto-convert uploaded images to WebP and videos to MP4

Editors upload whatever comes off a phone or camera. Some of the GI product
images were 12 MB and 27 MB each, and the whole set was ~62 MB. After a
one-off manual conversion to WebP it was ~1.9 MB with no visible loss, and
the Geographical Indications page became much faster. We want the backend
to do this automatically on every upload so nobody has to think about it.

Applies to every upload route that goes through `src/utils/upload.js`
(`multer`), i.e. all folders: `leaders`, `staff`, `gi-products`,
`gi-videos`, `focus-sectors`, `downloads` (images only — see below),
`misc`.

## 1. Images → WebP

**When:** after multer has saved the file, before the controller stores the
path on the document (so `applyUploadedFiles` sees the final `.webp`
path/URL, and `deleteLocal` still cleans up the old file on replace).

**Rules**

| Rule | Value |
|---|---|
| Library | [`sharp`](https://sharp.pixelplumbing.com/) |
| Input types | `image/jpeg`, `image/png` (leave `image/gif` untouched so animations survive) |
| Skip | Files already `image/webp` — do **not** re-encode (each lossy re-encode loses quality) |
| Output | `.webp`, quality **82**, `effort` 4–6 |
| Max size | Resize to **max 1920px wide**, `withoutEnlargement: true` (never upscale), keep aspect ratio |
| Orientation | `.rotate()` first so EXIF orientation is applied (phone photos), then metadata is stripped |
| Transparency | Keep the alpha channel (PNG logos must stay transparent) |
| Images that are already tiny | If the output would be **larger** than the input, keep the original |
| Original file | Delete the uploaded original after a successful conversion (only the `.webp` is kept) |
| Filename | Same unique name as today, with the extension swapped to `.webp` |
| Failure | If conversion throws, keep the original file and continue (log the error). An upload must never fail because of the optimiser |

Result: the JSON returned by the create/update endpoints has the `.webp`
URL in `image` / `photo` / etc., so the frontend needs no change.

`fileFilter` already accepts `image/webp`, so uploading WebP directly keeps
working.

## 2. Videos → MP4 (H.264 + AAC)

We deliberately picked **MP4/H.264 instead of WebM**: WebM is not reliably
playable on older iPhones/Safari, and a large share of visitors are on
phones. MP4 plays everywhere. (WebM can be added later as a second
`<source>` if wanted — not needed now.)

**When:** videos are slow to encode (minutes), so this must **not** run
inside the upload request. Run it as a background job.

**Flow**

1. Upload request saves the original as today and responds immediately
   (`201`/`200`) with the original path in `video` so the record is valid.
2. A background worker (simple in-process queue is fine — one job at a time
   — no Redis needed) converts the file.
3. On success it writes the new `.mp4` path onto the document's `video`
   field and deletes the original.
4. On failure it leaves the original in place and logs the error.

**ffmpeg settings**

```
ffmpeg -i <input> \
  -c:v libx264 -preset medium -crf 23 \
  -vf "scale='min(1280,iw)':-2" \
  -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  <output>.mp4
```

- `crf 23` is visually near-lossless for web; `scale` caps the width at
  720p-ish/1280 without upscaling (`-2` keeps the height even, which H.264
  requires).
- `-pix_fmt yuv420p` is required for Safari/iOS playback.
- `-movflags +faststart` moves the metadata to the front so the video starts
  playing before it has fully downloaded.
- Skip files that are already MP4/H.264 and under ~15 MB (don't re-encode
  what is already fine); still fine to run them through if simpler.
- Requires `ffmpeg` installed on the server (`fluent-ffmpeg` or a direct
  `child_process` call — either is fine). Please note it in the deployment
  docs / `.env.example`.

**Optional (nice to have):** expose a `videoStatus` field
(`"processing" | "ready" | "failed"`) on the document so the admin can show
"processing…" instead of a video that is about to change its URL. If that's
too much, skip it — the URL swap on completion is harmless because the
public site always reads the current `video` value.

## 3. Limits and config

- Raise or keep `fileSize: 80 * 1024 * 1024` in `upload.js` — the point is
  that big camera files are now fine because they get shrunk.
- Suggested env vars (all optional, with the defaults above):
  `IMAGE_MAX_WIDTH=1920`, `IMAGE_WEBP_QUALITY=82`, `VIDEO_MAX_WIDTH=1280`,
  `VIDEO_CRF=23`.
- `downloads` folder: PDFs/Word/Excel must be **left untouched** — only
  convert `image/*` and `video/*` mimetypes.

## 4. Acceptance checks

- Upload a 5 MB JPEG in the admin → stored file is `.webp`, noticeably
  smaller, looks identical at normal viewing size.
- Upload a transparent PNG logo → stays transparent.
- Upload a phone photo taken in portrait → not rotated sideways.
- Upload a `.webp` → stored unchanged (same bytes).
- Upload an animated GIF → stored unchanged.
- Replace an existing image → old file is deleted from disk (existing
  behaviour), only the new `.webp` remains.
- Upload a `.mov` from an iPhone → responds immediately, then a few minutes
  later the document's `video` points at a smaller `.mp4` that plays on
  iOS Safari, Chrome and Android, and starts before fully downloading.
- Upload a PDF to Downloads → unchanged.
- Kill `ffmpeg` / corrupt the file → upload still succeeds with the
  original kept, error logged.

## 5. Already done manually

All 25 existing GI product images were converted to WebP and re-uploaded
through `PUT /admin/gi-products/:id` (image field only), so there is nothing
to migrate for those. Other collections (leaders, staff, focus sectors,
downloads images) and the 5 GI videos still hold their original files —
if convenient, a one-off script running the same conversions over existing
uploads would finish the job.
