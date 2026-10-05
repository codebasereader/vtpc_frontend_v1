import { createReadStream, existsSync, statSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const KALALOKA_DEV_PORT = 3000
const KALALOKA_BUILD_DIR = path.resolve('public', 'kalaloka')
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' })
    const done = (open) => {
      socket.destroy()
      resolve(open)
    }
    socket.setTimeout(300, () => done(false))
    socket.once('connect', () => done(true))
    socket.once('error', () => done(false))
  })
}

// Kala Loka is a separate Next.js app mounted at /kalaloka. In development:
//   - if `npm run kalaloka:dev` is running (port 3000), requests are proxied to it (live reload);
//   - otherwise the last build (public/kalaloka, made by `npm run kalaloka:build`) is served as is;
//   - if neither exists, a short page says how to start it (instead of a bare 502).
// In production nginx serves the built files directly.
function kalalokaDevFallback() {
  return {
    name: 'kalaloka-dev-fallback',
    configureServer(server) {
      server.middlewares.use('/kalaloka', async (req, res, next) => {
        if (await isPortOpen(KALALOKA_DEV_PORT)) return next() // handed to the proxy below

        const urlPath = decodeURIComponent((req.originalUrl || req.url).split('?')[0])
        if (urlPath === '/kalaloka') {
          res.writeHead(301, { Location: '/kalaloka/' })
          return res.end()
        }

        let file = path.join(KALALOKA_BUILD_DIR, urlPath.replace(/^\/kalaloka/, ''))
        if (!file.startsWith(KALALOKA_BUILD_DIR)) {
          res.writeHead(403)
          return res.end()
        }
        if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')

        if (existsSync(file) && statSync(file).isFile()) {
          res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
          return createReadStream(file).pipe(res)
        }

        const notBuilt = !existsSync(path.join(KALALOKA_BUILD_DIR, 'index.html'))
        res.writeHead(notBuilt ? 503 : 404, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(
          notBuilt
            ? '<h1>Kala Loka is not running</h1><p>Start it with <code>npm run kalaloka:dev</code> (live), or build it once with <code>npm run kalaloka:build</code>, then reload.</p>'
            : '<h1>Page not found</h1>',
        )
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // A production bundle without an API address would silently call localhost
  // from every visitor's browser, so refuse to build one.
  if (command === 'build') {
    const apiUrl = loadEnv(mode, '.', 'VITE_').VITE_API_BASE_URL
    if (!apiUrl) {
      throw new Error('VITE_API_BASE_URL is not set. Set it to the HTTPS address of the API before building.')
    }
    if (!/^https:\/\//i.test(apiUrl) || /localhost|127\.0\.0\.1/.test(apiUrl)) {
      console.warn(`\n[security] VITE_API_BASE_URL is "${apiUrl}". Use the public HTTPS API address for a real deployment.\n`)
    }
  }

  return {
    plugins: [react(), tailwindcss(), kalalokaDevFallback()],
    server: {
      proxy: { '/kalaloka': { target: `http://localhost:${KALALOKA_DEV_PORT}`, changeOrigin: true, ws: true } },
    },
  }
})
