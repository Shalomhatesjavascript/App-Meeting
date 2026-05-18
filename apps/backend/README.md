# Backend Service

Shalom Social Media backend built with Elysia, Drizzle, and Cloudflare D1.

## First-time local setup (new contributors)

Assuming all dependencies are already installed (`bun install`), and the terminal supports Unix-style commands (for Windows, Git Bash or WSL should work):

1. Create/reset local D1, apply migrations, and seed demo data:
	```bash
	bun run onboard
	```
2. Start backend against local D1:
	```bash
	bun run dev
	```

The backend will use your local Wrangler D1 state for runtime DB access.

<!-- Removed stale note about demo OTP bypass. The live auth flow sends OTP emails. -->

## Architecture note

- **Users**: authentication records and login metadata (Better Auth-managed).
- **Profiles**: user-facing profile fields (alias, bio, avatar, intent, level, isComplete) stored in `profiles`.
- **UserMeta**: role and verification flags in `userMeta` used for access and feature gating.
- **UserInterests**: join table linking users to `interests` used by discovery scoring.
- **Likes / Matches / Messages**: interaction tables driving mutual matches and chat flows.

Keep backend source-of-truth in `apps/backend/src/` and API surface documented in `API_ROUTES.md`.

## Core commands

- Start dev server: `bun run dev`
- Typecheck: `bun run typecheck`
- Run backend tests: `bun run test`
- Recreate local DB and seed data: `bun run onboard`

## Auth model

- Primary auth is Better Auth session cookies (HttpOnly).
- Better Auth routes are mounted under `/api/better-auth/*`.
- Legacy bearer token and `x-user-*` trust headers are not used for identity.

## Validation conventions

- Shared request contracts live in `@repo/shared` validation schemas.
- Route handlers use strict integer parsing helpers for path/query IDs.
- Invalid numeric/query payloads should return `400` with a clear `{ error: string }` body.
- Ownership checks should use shared access-control helpers (`isSelfOrAdmin`) where applicable.
- Route exceptions should be normalized through `toRouteError` for consistent error mapping.

See `API_ROUTES.md` for frontend-facing endpoint details.

## D1 Notes (Important)

- `.env` variables (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`) are for Drizzle CLI commands only (`drizzle.config.ts`, `db:*` scripts).
- Runtime DB access comes from Wrangler binding `env.DB` in `wrangler.jsonc`.
- `wrangler dev` uses a local D1 database file by default, which can be empty.
- Use `wrangler dev --remote` when you want development to hit the remote D1 database that already has schema/data.

### Local-first workflow (recommended)

- Reset local D1, apply migrations, and seed demo data:
	- `bun run onboard`
- Re-seed local D1 without reset:
	- `bun run db:local:seed`
- Start backend against local D1:
	- `bun run dev`