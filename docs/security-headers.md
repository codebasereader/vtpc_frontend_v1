# Security headers for the frontend host

The frontend is a static site, so these headers must be set by the web server
(nginx, CDN, or hosting panel) that serves `dist/`. Replace `API_ORIGIN` with
the API address (the value of `VITE_API_BASE_URL`, e.g. `https://api.vtpc.karnataka.gov.in`).

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: API_ORIGIN https://*.tile.openstreetmap.org; media-src 'self' API_ORIGIN; connect-src 'self' API_ORIGIN; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Notes
- `style-src 'unsafe-inline'` is needed because the app uses inline `style` attributes (chart bars, map). Scripts stay locked to `'self'`.
- The admin preview iframes use `srcdoc` with `sandbox=""`; `frame-src 'none'` does not affect them.
- Test in the browser console for CSP violations after enabling (maps, fonts and uploaded images are the likely ones to need an extra origin).
- If the site is served at `/` and the API on another domain, keep `COOKIE_SAMESITE`/CORS on the backend in step with that.

## Kala Loka (`/kalaloka/`) needs its own, looser CSP
Kala Loka is a Next.js static export; its pages contain small inline scripts, so the strict
`script-src 'self'` policy above would break it. Give the `location /kalaloka/` block its own header
(see `docs/kalaloka.md`) and note that nginx does **not** inherit `add_header` lines from the parent
once a location defines its own — repeat the ones you want (HSTS, `Referrer-Policy`, …) inside it.
