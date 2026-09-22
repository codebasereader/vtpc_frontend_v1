import ffmpegPath from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const SOURCE_DIR =
  'E:/vtpc.karnataka.gov.in Source Code/20241206_vtpckarnatakavisvesvarayatra_b7e51cdc9d06b88b9857_20250424100417_archive/wp-content/themes/VTPC/assets/images'
const OUT_DIR = path.resolve('src/assets/videos')

const JOBS = [{ source: 'bannerVedio.mp4', out: 'hero-banner.mp4' }]

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

for (const job of JOBS) {
  const inputPath = path.join(SOURCE_DIR, job.source)
  const outputPath = path.join(OUT_DIR, job.out)
  console.log(`Re-encoding ${job.source} -> ${job.out}`)
  execFileSync(ffmpegPath, [
    '-y',
    '-i', inputPath,
    '-vf', 'scale=1280:-2',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'slow',
    '-an',
    outputPath,
  ])
  console.log(`Done: ${outputPath}`)
}
