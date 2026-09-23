# Shared Infra — Auth, Session, Env

Found while wiring the admin login page + dashboard against the real API
(2026-09-23). Codebase referenced: `vtpc_backend_v1` (read-only — no
changes made there, everything below is a request, not a report of an
edit).

## 🟡 `PUBLIC_BASE_URL` doesn't match the port the server actually runs on

`.env` has:
```
PORT=4200
PUBLIC_BASE_URL=http://localhost:4000
```

The server is confirmed listening on **4200** (`curl http://localhost:4200/health`
→ `{"ok":true,...}`; nothing listens on 4000). But every uploaded file URL
in API responses is built from `PUBLIC_BASE_URL`, so e.g.
`GET /leaders` returns:
```json
"photo": "http://localhost:4000/uploads/leaders/cm.jpg"
```
which 404s from a browser, since the actual server is on :4200.

**Ask:** either set `PUBLIC_BASE_URL=http://localhost:4200` locally to
match the real `PORT`, or standardize on `PORT=4000` (matches what's
usually meant by "the API port" in earlier discussion) and update
`PUBLIC_BASE_URL` to match. Either is fine — they just need to agree with
each other and with whatever port is actually passed to `npm start`.

**Frontend workaround in the meantime:** `VITE_API_BASE_URL` is set to
`http://localhost:4200` to match reality. No code change needed once the
env values above are fixed — just re-confirm the port frontend should
target.

## 🟢 Auth/session — confirmed working as expected

`POST /auth/login`, `POST /auth/logout`, `GET /auth/me` all behave exactly
as documented in `backend-api-contract.md` §3: httpOnly cookie
(`vtpc.sid`), `{id, name, role}` profile shape, 401 on missing/invalid
session. No changes needed here — noted only so it's clear this was
actually tested against the real server, not assumed.

## 🟢 CORS — confirmed working

`CORS_ORIGINS=http://localhost:5173,http://localhost:3000` in `.env`
already includes the frontend's dev origin (Vite default `:5173`), and
`credentials: true` is set correctly for the cookie-based auth flow. No
action needed for local dev. **Reminder for later:** when a real deploy
origin exists (e.g. `https://vtpc.karnataka.gov.in`), it needs to be added
to `CORS_ORIGINS` there too.
