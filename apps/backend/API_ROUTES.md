# Backend API Routes Reference

This document is a frontend-facing reference for all currently registered backend routes.

## Base URL

- Local dev (example): `http://localhost:8787`
- Health check: `GET /health`

All listed routes below are relative to the backend base URL.

## Auth Model (Current)

Most protected routes use header-based auth in `requireUser`/`requireAdmin`.

Common headers used by the frontend during development:

- `x-user-id`
- `x-user-role`
- `x-user-email`

Access levels in this document:

- `Public`: no auth required
- `User`: authenticated user required
- `Admin`: admin user required
- `User/Admin (owner)`: authenticated user; non-admin is limited to own records

## Response Conventions

- Success payloads generally return either `{ data: ... }` or `{ success: true }`.
- Validation/auth/not-found errors generally return `{ error: string }`.

---

## Health

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/health` | Public | Basic server health check |

## Auth (`/auth`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `RegisterSchema` | Creates user + verification flow |
| POST | `/auth/login` | Public | `LoginSchema` | Returns auth data/token payload |
| POST | `/auth/logout` | Public | none | Returns `{ success: true }` |
| POST | `/auth/verify` | Public | `VerifySchema` | Verifies email/code |
| POST | `/auth/forgot-password` | Public | `ForgotPasswordSchema` | Starts reset flow |
| POST | `/auth/reset-password` | Public | `ResetPasswordSchema` | Completes reset flow |

## Users (`/users`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/users` | Admin | `UserCreateSchema` | Create user |
| GET | `/users` | User | none | Admin gets full list; non-admin gets discoverable subset |
| GET | `/users/search` | User | `q`, `limit`, `offset` | Searches by email/alias/full name/department |
| GET | `/users/:id` | User/Admin (owner) | `id` path param | Admin or same user only |
| PATCH | `/users/:id` | User/Admin (owner) | `UserUpdateSchema` + `id` | Admin or same user only |
| DELETE | `/users/:id` | Admin | `id` path param | Delete user |
| POST | `/users/:id/ban` | Admin | `id` path param | Sets `is_banned = 1` |
| POST | `/users/:id/approve` | Admin | `id` path param | Sets `is_approved = 1` |
| GET | `/users/:id/stats` | Admin | `id` path param | Returns user engagement stats |

## Profiles (`/profiles`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/profiles/me` | User | none | Current user profile |
| GET | `/profiles/:user_id` | Public | `user_id` path param | Profile by user id |
| POST | `/profiles` | User | `ProfileCreateSchema` | Creates profile for requester |
| PUT | `/profiles/:user_id` | User/Admin (owner) | `ProfileUpdateSchema` + `user_id` | Update profile |
| DELETE | `/profiles/:user_id` | User/Admin (owner) | `user_id` path param | Delete profile |

## Interests (`/interests`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/interests` | Public | none | List interests |
| GET | `/interests/:id` | Public | `id` path param | Get interest by id |
| POST | `/interests` | Admin | `InterestCreateSchema` | Create interest |
| PUT | `/interests/:id` | Admin | `InterestUpdateSchema` + `id` | Update interest |
| DELETE | `/interests/:id` | Admin | `id` path param | Delete interest |

## User Interests (`/user-interests`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/user-interests/:userId` | Public | `userId` path param | List interests for user |
| POST | `/user-interests` | User/Admin (owner) | `{ user_id, interest_id }` | Add interest to user |
| DELETE | `/user-interests` | User/Admin (owner) | `{ user_id, interest_id }` | Remove interest from user |

## Likes (`/likes`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/likes` | User/Admin (owner) | `LikeCreateSchema` | Like/pass action |
| GET | `/likes/mutual` | User/Admin (owner) | `user_id` (optional query) | Mutual likes for user |
| GET | `/likes/:id` | User | `id` path param | Fetch like by id |
| GET | `/likes` | User/Admin (owner) | `user_id` (optional), `type` (`sent` or `received`) | List likes |

## Matches (`/matches`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| POST | `/matches` | Admin | `MatchCreateSchema` | Create match (system/admin) |
| GET | `/matches` | User | none | List matches for requester |
| GET | `/matches/:id` | User/Admin (participant) | `id` path param | Participant/admin only |

## Messages (`/messages`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/messages/:match_id` | User/Admin (participant) | `match_id` path, `before_id`/`limit` query | Paginated match messages |
| POST | `/messages` | User/Admin (owner) | `MessageCreateSchema` | Send message |
| POST | `/messages/:id/read` | User | `id` path param | Mark message as read |

## Subscriptions (`/subscriptions`)

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/subscriptions` | Admin | none | List all subscriptions |
| GET | `/subscriptions/me` | User | none | Current user subscription |
| GET | `/subscriptions/:user_id` | Admin | `user_id` path param | Get user subscription |
| POST | `/subscriptions` | User/Admin (owner) | `SubscriptionCreateSchema` | Create subscription |
| PATCH | `/subscriptions/:id` | User/Admin (owner) | `SubscriptionUpdateSchema` + `id` | Update subscription |
| DELETE | `/subscriptions/:id` | User/Admin (owner) | `id` path param | Delete/cancel subscription |

## Discovery (`/discovery`)

All discovery routes are server-scored and sorted (highest score first).

| Method | Path | Access | Body / Query | Notes |
|---|---|---|---|---|
| GET | `/discovery/recommendations` | User | `limit`, `offset` | Main recommendations feed |
| GET | `/discovery/possible-matches` | User | `limit`, `offset`, `minScore` | Filters recommendations by minimum score |
| GET | `/discovery/candidates` | User | `limit`, `offset` | Legacy/discover feed alias |

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
- For profile onboarding/edit, use `POST /profiles` then `PUT /profiles/:user_id` as needed.
