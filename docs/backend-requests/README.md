# Backend Requests

This folder tracks anything the frontend needs from the backend
(`vtpc_backend_v1`) — bugs, missing endpoints, shape mismatches — found
while building each page's CMS integration. One file per page/area, added
as we get to it (not all upfront). Share the relevant file(s) with the
backend dev as needed; each item is self-contained.

The full API contract (all endpoints, shapes, auth flow) lives at
[`../backend-api-contract.md`](../backend-api-contract.md) — this folder is
for *specific, actionable requests* found during real integration, not the
general reference.

| File | Covers |
|---|---|
| [`00-shared-infra.md`](./00-shared-infra.md) | Auth/session, CORS, env config — things every page depends on |
| [`01-leaders.md`](./01-leaders.md) | Leaders CRUD — confirmed schema/contract, one open question (should `name` be bilingual?) |

Status legend: 🔴 blocking · 🟡 should fix · 🟢 fixed / confirmed working
