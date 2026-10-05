// Builds the Kala Loka project (kalaloka/) into static files and copies them to
// public/kalaloka, so `vite build` ships them as dist/kalaloka — one artifact,
// served by nginx at https://<site>/kalaloka/.
//
//   node scripts/buildKalaloka.mjs
//
// KALALOKA_SITE_URL sets the public address used in canonical links, the sitemap
// and share previews. It must include the /kalaloka path.

import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const DEFAULT_SITE_URL = 'https://vtpc.karnataka.gov.in/kalaloka'

const projectDir = path.resolve('kalaloka')
const outDir = path.join(projectDir, 'out')
const target = path.resolve('public', 'kalaloka')
const siteUrl = (process.env.KALALOKA_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')

if (!siteUrl.endsWith('/kalaloka')) {
  throw new Error(`KALALOKA_SITE_URL must end with /kalaloka (got "${siteUrl}")`)
}

function run(command, args) {
  // npm/npx are .cmd files on Windows, which need a shell; the arguments are fixed strings.
  const result = spawnSync([command, ...args].join(' '), {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: siteUrl },
  })
  if (result.status !== 0) throw new Error(`"${command} ${args.join(' ')}" failed`)
}

if (!existsSync(path.join(projectDir, 'node_modules'))) {
  console.log('Installing Kala Loka dependencies…')
  run('npm', ['ci', '--no-audit', '--no-fund'])
}

console.log(`Building Kala Loka for ${siteUrl}`)
run('npx', ['next', 'build'])

if (!existsSync(path.join(outDir, 'index.html'))) {
  throw new Error('Kala Loka build produced no index.html — nothing to copy')
}

rmSync(target, { recursive: true, force: true })
cpSync(outDir, target, { recursive: true })
console.log(`Copied Kala Loka to ${path.relative(process.cwd(), target)}`)
