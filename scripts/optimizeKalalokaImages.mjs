// Converts the Kala Loka project's large PNG/JPG images to WebP and points the
// code at the new files. Safe to re-run: files that are already small or
// already WebP are left alone. Run it after dropping in a new version of the
// Kala Loka project, before `npm run build`.
//
//   node scripts/optimizeKalalokaImages.mjs

import ffmpegPath from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('kalaloka')
const PUBLIC_DIR = path.join(ROOT, 'public')
const CODE_DIRS = ['app', 'components', 'utils'].map((dir) => path.join(ROOT, dir))
const MIN_BYTES = 40 * 1024 // tiny files (logos used in JSON-LD, icons) are not worth converting
const MAX_WIDTH = 1920
const QUALITY = 82

function walk(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, visit)
    else visit(full)
  }
}

const toUrl = (file) => `/${path.relative(PUBLIC_DIR, file).split(path.sep).join('/')}`

const renames = new Map() // old public URL -> new public URL
let before = 0
let after = 0

walk(PUBLIC_DIR, (file) => {
  if (!/\.(png|jpe?g)$/i.test(file)) return
  const size = statSync(file).size
  if (size < MIN_BYTES) return

  const target = file.replace(/\.(png|jpe?g)$/i, '.webp')
  before += size
  if (!existsSync(target)) {
    execFileSync(ffmpegPath, [
      '-y', '-loglevel', 'error', '-i', file,
      '-vf', `scale='min(${MAX_WIDTH},iw)':-1`,
      '-c:v', 'libwebp', '-quality', String(QUALITY), '-compression_level', '6',
      target,
    ])
  }
  if (!existsSync(target) || statSync(target).size === 0) {
    throw new Error(`Conversion failed for ${file}`)
  }
  after += statSync(target).size
  renames.set(toUrl(file), toUrl(target))
  unlinkSync(file)
})

// Existing WebP files can be heavy too (some are over 1 MB): re-encode the big ones.
const HEAVY_WEBP_BYTES = 400 * 1024
let shrunk = 0
walk(PUBLIC_DIR, (file) => {
  if (!/\.webp$/i.test(file) || statSync(file).size < HEAVY_WEBP_BYTES) return
  const temp = `${file}.tmp.webp`
  execFileSync(ffmpegPath, [
    '-y', '-loglevel', 'error', '-i', file,
    '-vf', `scale='min(${MAX_WIDTH},iw)':-1`,
    '-c:v', 'libwebp', '-quality', '75', '-compression_level', '6',
    temp,
  ])
  if (existsSync(temp) && statSync(temp).size > 0 && statSync(temp).size < statSync(file).size) {
    after += statSync(temp).size - statSync(file).size
    renameSync(temp, file)
    shrunk += 1
  } else if (existsSync(temp)) {
    unlinkSync(temp)
  }
})

let rewritten = 0
for (const dir of CODE_DIRS) {
  walk(dir, (file) => {
    if (!/\.(js|jsx|mjs)$/.test(file)) return
    const original = readFileSync(file, 'utf8')
    let text = original
    for (const [from, to] of renames) {
      for (const quote of ['"', "'", '`']) text = text.split(from + quote).join(to + quote)
    }
    if (text !== original) {
      writeFileSync(file, text)
      rewritten += 1
    }
  })
}

const mb = (bytes) => (bytes / 1048576).toFixed(1)
console.log(`Converted ${renames.size} images: ${mb(before)} MB → ${mb(after)} MB`)
console.log(`Re-encoded ${shrunk} heavy WebP files`)
console.log(`Updated image paths in ${rewritten} source files`)
