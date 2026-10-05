# Kala Loka (`/kalaloka`)

Kala Loka was built by another team as a separate **Next.js** app (`kalaloka/`). It has no
backend. It is built to **plain static files** and served by nginx at
`https://<site>/kalaloka/`, next to the main React app. The menu item **Kalaloka** opens it in
a new tab (a normal link, not a React Router link).

## How it fits together
- `kalaloka/` — their project, kept intact (own `package.json`). Changed only to work under a base
  path and as a static export: `next.config.mjs`, `components/AppImage.js`, `utils/basePath.js`,
  static icon / share images in `public/`.
- `scripts/buildKalaloka.mjs` — installs its dependencies if needed, runs `next build`, copies the
  result to `public/kalaloka`. `npm run build` runs it before `vite build`, so the final
  `dist/` already contains `dist/kalaloka/`. One artifact to deploy.
- `public/kalaloka` is generated (git-ignored). `kalaloka/node_modules`, `.next`, `out` are ignored too.
- `KALALOKA_SITE_URL` (default `https://vtpc.karnataka.gov.in/kalaloka`) sets canonical links,
  the sitemap and share previews. It must end in `/kalaloka`.

## Local development
```
npm run kalaloka:dev   # Kala Loka on :3000 (terminal 1)
npm run dev            # main site on :5173 (terminal 2) — /kalaloka is proxied to :3000
```
Open http://localhost:5173/kalaloka/. If `kalaloka:dev` is not running the proxy returns an error.
(A "1 Issue" badge about `cz-shortcut-listen` is a browser extension, not a bug.)

## Updating Kala Loka when the other team sends a new version
1. Replace the files in `kalaloka/` (keep our changes listed above — compare with git).
2. `npm run kalaloka:optimize-images` — converts new PNG/JPG to WebP (cuts ~90% of the size) and
   rewrites the paths in their code.
3. In any new code use `@/components/AppImage` instead of `next/image`, and `withBase()` for any
   plain `href`/`src` to a file in `kalaloka/public`. Without that the file 404s under `/kalaloka`.
4. `npm run build` and open `/kalaloka/`.

## nginx (RHEL)
```nginx
server {
    root /var/www/vtpc/dist;            # the Vite build, which contains kalaloka/

    location /kalaloka/ {
        try_files $uri $uri/ =404;       # real files only, NOT the React fallback
        error_page 404 /kalaloka/404.html;

        # Kala Loka uses inline scripts, so it needs a looser CSP than the main site.
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" always;
        add_header X-Content-Type-Options "nosniff" always;
        # repeat any other global add_header lines here (nginx drops parent ones inside a location with its own)

        location /kalaloka/_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location = /kalaloka { return 301 /kalaloka/; }

    location / { try_files $uri $uri/ /index.html; }   # main React app, keep after the block above
}
```
- SELinux (RHEL): files must be labelled `httpd_sys_content_t` (`chcon -R -t httpd_sys_content_t /var/www/vtpc`).
- Add `Sitemap: https://<site>/kalaloka/sitemap.xml` to the main site's `robots.txt` (a `robots.txt`
  inside `/kalaloka` is ignored by search engines).
- If nginx isn't set up, `/kalaloka` falls through to the React app, which shows a clear
  "Kala Loka is not available" page instead of looping.

## Known data issue fixed
`/our-brands` referenced `coffees-of-karnataka.jpeg`, but the file is a PNG — now points at the WebP.
