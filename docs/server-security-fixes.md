# Server-level security fixes (EC2 / nginx)

Companion to the Digital Age VAPT report of 12 Oct 2026 (`DigAge:TR:VTPC:2026-27:0124`).
This file covers **only what must be done on the EC2 server**. The application-code fixes are already
in the frontend and backend repos and ship with the next deploy (see section 8 for what changes there).

| Report finding | Fixed by |
|---|---|
| 8. Insufficient Content Security Policy | nginx header (section 3) |
| 10. Missing X-XSS-Protection | nginx header (section 3) |
| 11. Cache-Control header missing | nginx cache rules (section 4) |
| 4. Improper session management (idle timeout) | backend `.env` (section 6) |
| 2. Session hijacking (cookie flags) | backend `.env` — `NODE_ENV=production` and HTTPS (section 6) |
| 1, 2, 3, 4, 5, 6, 7, 9 | application code — see section 8 |

Assumptions (adjust if the server differs): Ubuntu/RHEL with **nginx** and **pm2**, one domain
`www.selinodevlabs.com`, the React build in `/var/www/vtpc/dist`, the API (Node, port 4200) proxied under `/api/`,
TLS already working. The test URL in the report was `https://www.selinodevlabs.com/admin/login`.

---

## 0. Before you touch anything

```bash
sudo cp -a /etc/nginx /etc/nginx.bak-$(date +%F)       # one-command rollback copy
sudo nginx -t                                           # must say "syntax is ok" BEFORE and AFTER every change
```
Every nginx change below is applied with `sudo nginx -t && sudo systemctl reload nginx`. A reload does not drop
connections, and if `-t` fails nothing is reloaded, so a typo cannot take the site down.

---

## 1. Deploy order (important)

1. **Backend first** (new code + `.env` changes in section 6), then `pm2 restart`.
2. **Frontend** — upload the new `dist/`.
3. **nginx** changes (this document, sections 2–5).

Everyone who is logged into the admin panel will be signed out once at step 1 (old sessions have no browser
fingerprint, see finding 2). That is expected. Do it outside working hours if possible.

---

## 2. nginx — shared security headers (one file)

Create `/etc/nginx/snippets/vtpc-security-headers.conf`:

```nginx
# --- Findings 8 and 10 ------------------------------------------------------
# Content-Security-Policy for the React site and the admin panel.
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.tile.openstreetmap.org; media-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;

# Finding 10. Modern browsers ignore this header (CSP above is the real protection); it is
# sent because the audit asks for it. It does no harm.
add_header X-XSS-Protection "1; mode=block" always;

# Other standard hardening headers (not in the report, but the next scan will ask for them).
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Why each source is in the CSP:
- No `'unsafe-inline'` for styles or scripts on the React site (finding 8 retest: "change unsafe-inline to safe"). React `style={{}}` props go through the CSSOM, which CSP does not block. The `/kalaloka` Next.js app is the exception, it has its own CSP below.
- `https://fonts.googleapis.com` / `https://fonts.gstatic.com` — Inter, Manrope and Noto Sans Kannada are loaded from Google Fonts.
- `https://*.tile.openstreetmap.org` — the warehouse map on Exporter Corner.
- `connect-src 'self'` and `img-src 'self'` — works because the API is on the **same origin** (`/api/...`), including uploaded
  images/videos (`/api/uploads/...`). **If the API is on a different host** (e.g. `api.example.gov.in`), add that origin to
  `connect-src`, `img-src` and `media-src`.
- `frame-ancestors 'none'` — nobody can embed the site in a frame (clickjacking).

> **Roll it out in report-only mode first (recommended by the auditor too).** For the first deploy, change the header name to
> `Content-Security-Policy-Report-Only`, open the home page, Exporter Corner (map), About Us, Events, Downloads, the Kala Loka intro
> page and `/admin`, and watch the browser console for "Refused to load…" messages. When there are none, rename it back to
> `Content-Security-Policy` and reload nginx.

---

## 3. nginx — the site `server` block

`/etc/nginx/sites-available/vtpc` (or your existing file). Keep your own `ssl_certificate` lines and `server_name`.

```nginx
server {
    listen 443 ssl http2;
    server_name www.selinodevlabs.com;
    # ssl_certificate / ssl_certificate_key: keep what certbot already put here.

    server_tokens off;                          # don't advertise the nginx version
    root /var/www/vtpc/dist;
    index index.html;
    client_max_body_size 80M;                   # admin uploads (largest legitimate file is a video)

    include snippets/vtpc-security-headers.conf;

    # ---- API (Node on :4200). The /api/ prefix is stripped before it reaches Node.
    location /api/ {
        proxy_pass http://127.0.0.1:4200/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;      # overwrite: never trust a client-supplied value
        proxy_set_header X-Forwarded-Proto $scheme;
        # nginx drops parent add_header lines inside a location that sets its own, so we set none here.
        # The API sends its own strict headers and "Cache-Control: no-store" for /auth and /admin.
    }

    # ---- Finding 11: never cache pages. Hashed build files are the only long-cached thing.
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        include snippets/vtpc-security-headers.conf;     # repeat: this location defines its own add_header
    }

    location /assets/ {
        # Vite names these files by content hash, so a new build is always a new URL.
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        include snippets/vtpc-security-headers.conf;
        try_files $uri =404;
    }

    # ---- Kala Loka (separate Next.js static export) needs inline scripts: its own, looser CSP.
    location /kalaloka/ {
        try_files $uri $uri/ =404;
        error_page 404 /kalaloka/404.html;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Cache-Control "no-cache" always;

        location /kalaloka/_next/static/ {
            add_header Cache-Control "public, max-age=31536000, immutable" always;
            add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" always;
            add_header X-Content-Type-Options "nosniff" always;
        }
    }
    location = /kalaloka { return 301 /kalaloka/; }

    # ---- React app: everything else falls back to index.html (client-side routing, incl. /admin/login).
    location / {
        try_files $uri /index.html;
        # HTML for every route (including /admin/login) must not be cached.
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        include snippets/vtpc-security-headers.conf;
    }
}

server {                                         # plain HTTP only redirects
    listen 80;
    server_name www.selinodevlabs.com;
    return 301 https://$host$request_uri;
}
```

Why the repeated `include` lines: **nginx does not inherit `add_header` from the parent once a location defines its own.**
Forgetting this is the most common reason a header "disappears" on some pages.

Other static files that are not under `/assets/` (favicon, `/assets/video/…`, templates) are served by the `location /`
rule above and therefore are not cached. If the home-page video feels slow because of that, add a small rule such as
`location ~* \.(webm|mp4|svg|png|jpe?g|webp)$ { add_header Cache-Control "public, max-age=86400" always; include snippets/vtpc-security-headers.conf; }`
— these are public marketing files, not sensitive data. Do **not** do this for `/api/` or HTML.

Apply:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. Optional: extra brake on admin login guessing

The backend already rate-limits login (15 tries / 15 min per address, 10 per address+email) and now asks a simple
question after 3 failures. If you also want nginx to cap it, in the `http {}` block of `/etc/nginx/nginx.conf` add
`limit_req_zone $binary_remote_addr zone=vtpc_login:10m rate=10r/m;` and inside the server block:

```nginx
    location = /api/auth/login {
        limit_req zone=vtpc_login burst=5 nodelay;
        proxy_pass http://127.0.0.1:4200/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

---

## 5. TLS check (no finding, but verify once)

```bash
curl -sI https://www.selinodevlabs.com | grep -i strict-transport      # HSTS present
openssl s_client -connect www.selinodevlabs.com:443 -tls1_1 </dev/null 2>&1 | grep -i "alert\|handshake"   # must FAIL (TLS 1.1 off)
```
`ssl_protocols TLSv1.2 TLSv1.3;` should be set (certbot's `options-ssl-nginx.conf` already does this).

---

## 6. Backend `.env` on the server (`vtpc_backend_v1/.env`)

```ini
NODE_ENV=production            # turns on the Secure flag for the session cookie (finding 2). Needs HTTPS.
TRUST_PROXY=1                  # so rate limits, audit log IPs and Secure cookies see the real client behind nginx
PUBLIC_BASE_URL=https://www.selinodevlabs.com/api
CORS_ORIGINS=https://www.selinodevlabs.com
COOKIE_SAMESITE=lax            # frontend and API share a domain
SESSION_SECRET=<48+ random characters>     # e.g. `openssl rand -hex 32`
SESSION_IDLE_MINUTES=20        # finding 4 (the old value was 120). The new default is 20, but set it explicitly.
SESSION_ABSOLUTE_HOURS=12
```
Then `pm2 restart ecosystem.config.cjs --update-env` (or `pm2 restart all --update-env`) and `pm2 logs` for errors.
The server refuses to start in production with the example session secret.

---

## 7. Verify (run from any machine, after deploy)

```bash
# Findings 8, 10, 11 — headers on the exact URL the auditor tested
curl -sI https://www.selinodevlabs.com/admin/login | grep -iE "content-security-policy|x-xss-protection|cache-control|x-frame|x-content-type|strict-transport"
#   expect: CSP present, X-XSS-Protection: 1; mode=block, Cache-Control: no-store, no-cache, must-revalidate, max-age=0

# Hashed build files stay cacheable (so the site is not slower)
curl -sI https://www.selinodevlabs.com/assets/$(ls /var/www/vtpc/dist/assets | grep -m1 '^index-.*\.js$') | grep -i cache-control
#   expect: public, max-age=31536000, immutable

# Kala Loka still has its own CSP
curl -sI https://www.selinodevlabs.com/kalaloka/ | grep -i content-security-policy

# API still answers and authenticated routes are not cached
curl -s https://www.selinodevlabs.com/api/health
curl -sI https://www.selinodevlabs.com/api/auth/me | grep -i cache-control      # no-store (401 is expected without a login)

# Cookie flags after a real login (Secure + HttpOnly + SameSite)
curl -si -X POST https://www.selinodevlabs.com/api/auth/login -H 'Content-Type: application/json' \
  -H 'Origin: https://www.selinodevlabs.com' -d '{"email":"…","password":"…"}' | grep -i set-cookie
```
Then open the home page, Exporter Corner (map), Events, `/kalaloka/`, `/about-kala-loka` and `/admin` in a browser with the console
open: there should be **no** red "Content Security Policy" errors.

## 8. What the code deploy changes (for reference — nothing to do on the server)

| Finding | What changed |
|---|---|
| 1 Auth bypass via response manipulation | Login no longer trusts the login reply; it confirms the session with a separate `/auth/me` call. The server already checks the session on every admin API call. |
| 2 Session hijacking | A session is tied to the browser that logged in; a copied cookie used from another browser is refused and that session is ended. Cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in production. |
| 3 Input fields not sanitised | Every admin search box accepts only letters (any language), numbers, spaces and `. - _ @ + ,` and is limited to 80 characters. |
| 4 Improper session management | Server idle timeout 20 min (was 120). Browser signs out after 15 min of no activity, with a 60-second warning. |
| 5 Simultaneous login | One active session per account: a new login signs the account out everywhere else. |
| 6 Password history | The last 5 passwords cannot be reused (change password and admin reset). |
| 7 Missing CAPTCHA | After 3 failed logins the form asks a simple self-hosted question. Rate limits stay. **MFA is not implemented (decision: not now).** |
| 9 No forgot-password | Handled by an administrator-managed process (below). The login page says so. |

### Password recovery process (finding 9 — administrator-managed, as the report allows)
1. The user asks a Super Admin (in writing, from their official email address).
2. The Super Admin confirms the person's identity, then uses **Admin → Users → Reset password**.
3. The user logs in with the temporary password and is forced to choose a new one (it cannot be one of their last 5).
4. The reset, who did it, and the user's sessions being ended are all recorded in **Admin → Audit logs**.

## 9. Rollback
```bash
sudo rm -rf /etc/nginx && sudo cp -a /etc/nginx.bak-<date> /etc/nginx && sudo nginx -t && sudo systemctl reload nginx
```
Backend: `git checkout <previous commit> && pm2 restart all`.
