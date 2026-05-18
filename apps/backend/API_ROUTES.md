# Backend API Routes Reference

This document is a frontend-facing reference for all currently registered backend routes.

## Base URL

- Local dev (example): `http://localhost:8787`
- Health check: `GET /health`

All listed routes below are relative to the backend base URL. All feature routes are mounted under the `/api/` prefix (for example `/api/users`, `/api/profiles`).

## Auth Model (Current)

Primary authentication uses Better Auth HttpOnly cookie sessions.

- Session endpoints live under `/api/better-auth/*`.
- Frontend requests should include credentials/cookies.
- Legacy Bearer token and custom `x-user-*` identity headers are no longer supported.

Access levels in this document:

- `Public`: no auth required
- `User`: authenticated user required
- `Admin`: admin user required
- `User/Admin (owner)`: authenticated user; non-admin is limited to own records

## Response Conventions

- Success payloads generally return either `{ data: ... }` or `{ success: true }`.
- Validation/auth/not-found errors generally return `{ error: string }`.


## Validation and Parsing Conventions

- Path IDs and numeric query values are parsed as strict integers.
- Invalid numeric formats (floats, negative values for non-negative fields, non-numeric strings) return `400`.
- Some routes clamp validated values for safety while preserving compatibility:
	- Discovery and user-search `limit` are clamped to `<= 100`.
	- Discovery/user-search `offset` and `minScore` are clamped to `>= 0`.
- Date/time fields use ISO-compatible strings. Subscriptions accept ISO date (`YYYY-MM-DD`) and ISO date-time values.

---
## Health

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/health` | Public | Basic server health check |

## Better Auth (`/api/better-auth`)

These are managed by Better Auth and should be consumed via the Better Auth client.

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/api/better-auth/sign-in/email` | Public | Better Auth payload | Creates session cookie on success |
| POST | `/api/better-auth/sign-up/email` | Public | Better Auth payload | Creates account and session cookie |
| POST | `/api/better-auth/sign-out` | User | none | Clears session cookie |
| GET | `/api/better-auth/get-session` | User | none | Returns current session/user |

## Users (`/api/users`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/users` | Admin | `UserCreateSchema` | Create user |
| GET | `/api/users` | User | none | Admin gets full list; non-admin gets discoverable subset |
| GET | `/api/users/search` | User | `q`, `limit`, `offset` | Searches by email/alias/full name/department |
| GET | `/api/users/:id` | User/Admin (owner) | `id` path param | Admin or same user only |
| PATCH | `/api/users/:id` | User/Admin (owner) | `UserUpdateSchema` + `id` | Admin or same user only |
| DELETE | `/api/users/:id` | Admin | `id` path param | Delete user |
| POST | `/api/users/:id/ban` | Admin | `id` path param | Sets `is_banned = 1` |
| POST | `/api/users/:id/approve` | Admin | `id` path param | Sets `is_approved = 1` |
| GET | `/api/users/:id/stats` | Admin | `id` path param | Returns user engagement stats |

## Profiles (`/api/profiles`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/api/profiles/me` | User | none | Current user profile |
| GET | `/api/profiles/:id` | User | `id` path param | Profile by user id. Requires auth; hides `fullName` unless requester is the owner or admin. |
| POST | `/api/profiles` | User | `ProfileCreateSchema` | Creates profile for requester. Includes persisted avatar seed/style fields. |
| PUT | `/api/profiles/:id` | User/Admin (owner) | `ProfileUpdateSchema` + `id` | Update profile. Includes persisted avatar seed/style fields. |
| DELETE | `/api/profiles/:id` | User/Admin (owner) | `id` path param | Delete profile |

## Interests (`/interests`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/interests` | Public | none | List interests |
| GET | `/interests/:id` | Public | `id` path param | Get interest by id |
| POST | `/interests` | Admin | `InterestCreateSchema` | Create interest |
| PUT | `/interests/:id` | Admin | `InterestUpdateSchema` + `id` | Update interest |
| DELETE | `/interests/:id` | Admin | `id` path param | Delete interest |

## User Interests (`/api/user-interests`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/api/user-interests/:id` | User/Admin (owner) | `id` path param | List interests for user (admin or the user only) |
| POST | `/api/user-interests` | User/Admin (owner) | `{ user_id, interest_id }` | Add interest to user |
| DELETE | `/api/user-interests` | User/Admin (owner) | `{ user_id, interest_id }` | Remove interest from user |

## Likes (`/api/likes`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/api/likes` | User/Admin (owner) | `LikeCreateSchema` | Like/pass action |
| GET | `/api/likes/mutual` | User/Admin (owner) | `user_id` (optional query) | Mutual likes for user |
| GET | `/api/likes/:id` | User | `id` path param | Fetch like by id |
| GET | `/api/likes` | User/Admin (owner) | `user_id` (optional), `type` (`sent` or `received`) | List likes |

## Matches (`/api/matches`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/api/matches` | Admin | `MatchCreateSchema` | Create match (system/admin) |
| GET | `/api/matches` | User | none | List matches for requester |
| GET | `/api/matches/:id` | User/Admin (participant) | `id` path param | Participant/admin only |

## Messages (`/api/messages`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/api/messages/match/:match_id` | User/Admin (participant) | `match_id` path, `limit` query | Paginated match messages (positive integer query values) |
| POST | `/api/messages` | User/Admin (owner) | `MessageCreateSchema` | Send message |
| POST | `/api/messages/:id/read` | User/Admin (participant) | `id` path param | Mark message as read |

## Subscriptions (`/subscriptions`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/subscriptions` | Admin | none | List all subscriptions |
| GET | `/subscriptions/me` | User | none | Current user subscription |
| GET | `/subscriptions/:id` | Admin | `id` path param | Get user subscription |
| POST | `/subscriptions` | User/Admin (owner) | `SubscriptionCreateSchema` | Create subscription |
| PATCH | `/subscriptions/:id` | User/Admin (owner) | `SubscriptionUpdateSchema` + `id` | Update subscription |
| DELETE | `/subscriptions/:id` | User/Admin (owner) | `id` path param | Delete/cancel subscription |

## Discovery (`/discovery`)

All discovery routes are server-scored and sorted (highest score first).

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/discovery/recommendations` | User | `limit`, `offset` | Main recommendations feed (`limit` max 100) |
| GET | `/discovery/possible-matches` | User | `limit`, `offset`, `minScore` | Filters recommendations by minimum score (`limit` max 100) |
| GET | `/discovery/candidates` | User | `limit`, `offset` | Legacy/discover feed alias (`limit` max 100) |

## Admin Logs (`/admin-logs`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/admin-logs` | Admin | `admin_id`, `target_user_id`, `action`, `from`, `to` (all optional) | List logs with filters |
| GET | `/admin-logs/:id` | Admin | `id` path param | Fetch single log |
| POST | `/admin-logs` | Admin | `AdminLogCreateSchema` | Create log entry |

---

## Quick Frontend Integration Notes

- For recommendations UI, use `GET /discovery/recommendations` (or `/possible-matches` for stricter results).
- For user search UI, use `GET /users/search?q=...&limit=...&offset=...`.
- For chat pages, sequence is usually: `GET /matches` -> `GET /messages/:match_id` -> `POST /messages`.
- For profile onboarding/edit, use `POST /api/profiles` then `PUT /api/profiles/:user_id` as needed.
