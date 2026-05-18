# AGENTS.md

## Purpose
This repository is a monorepo for a student-focused social meeting app. It is designed to help students at Babcock University connect through profiles, interests, likes, matches, messaging, and subscription tiers.

This file is meant for AI agents working on the repository. It describes the repo structure, coding conventions, tooling, current state, objectives, and where to find the most relevant data.

---

## Top-level mental model

- The repo is a **Turborepo monorepo** with Bun as the package manager.
- The codebase is split into a backend service, frontend app, and shared package artifacts.
- Backend and frontend are related but developed separately, with shared types/validation in `packages/shared`.
- The backend is the source of truth for API behavior and authentication.
- The frontend consumes backend APIs and should stay consistent with backend contract changes.
- Use the existing conventions and shared helpers rather than inventing new architecture unless there is a strong reason.

---

## Repo structure

- `/` – root workspace
  - `README.md` – repository overview and common commands
  - `package.json` – root Bun/turbo scripts and workspace settings
  - `biome.json` – formatting and linting config
  - `tsconfig.json` – base TypeScript setup
  - `turbo.json` – monorepo task pipeline config
  - `TODO.md` – current known work and review items
  - `requirements/` – product-level requirements and intention documentation
  - `AGENTS.md` – this file

- `apps/backend/` – server-side app
  - `package.json` – backend dependencies and scripts
  - `src/` – backend source code
    - `shared/` – shared backend helpers (route-error, route-prefixes, schema)
    - `utils/` – runtime helpers (auth, db, other utilities)
    - `admin-logs/`, `discovery/`, `interests/`, `likes/`, `matches/`, `messages/`, `profiles/`, `subscriptions/`, `user/`, `user-interests/` – feature modules
  - `drizzle.config.ts` – Drizzle database config
  - `wrangler.jsonc` – Cloudflare Workers / D1 runtime config
  - `API_ROUTES.md` – frontend-facing endpoint documentation

- `apps/frontend/` – client-side app
  - `package.json` – frontend dependencies and scripts
  - `src/` – React app source code
    - `api/` – API client or service wrappers
    - `components/` – UI components
    - `pages/` – page views
    - `context/`, `lib/`, `utils/` – frontend utilities

- `packages/shared/` – shared code between backend and frontend
  - `validation/` – shared validation schemas, enums, and types
  - `index.ts` – shared exports used by workspace packages

---

## Tooling and workflow

### Package manager
- `bun` is the package manager. Prefer `bun install` and `bun run`.
- Root `package.json` declares `packageManager: "bun@1.3.0"`.
- Use workspace imports like `@repo/shared`, `@repo/backend`, `@repo/frontend`.
 - Backend scripts frequently use `bunx` to run CLI tools (for example, `bunx drizzle-kit` and `bunx wrangler`).

### Common root commands
- `bun install` – install dependencies
- `bun run dev` – run dev tasks for all apps via turbo
- `bun run build` – build all apps/packages via turbo
- `bun run lint` – lint all apps/packages via turbo
- `bun run check` – run Biome check across the repo
- `bun run check:write` – format/lint with fixes
- `bun run test` – run tests via turbo
- `bun run hooks:setup` – install repo-local git hooks from `.githooks`

### Backend commands
- `bun run dev` – start `wrangler dev` for the backend
- `bun run onboard` – reset local D1 and seed demo data
- `bun run db:local:reset` – reset local D1 and apply migrations
- `bun run db:local:seed` – seed local D1
- `bun run typecheck` – run backend TypeScript typecheck
- `bun run test` – run backend tests

### Frontend commands
- `bun run dev` – start Vite development server
- `bun run build` – build frontend assets
- `bun run preview` – preview built frontend
- `bun run typecheck` – run frontend typecheck

### Formatting and linting
- `biome` is used for formatting and linting.
- Git hooks should be installed via `bun run hooks:setup`.
- Pre-commit hook runs `biome check --write --staged` on staged files.
- Keep code formatted and lint-clean before committing.

---

## Backend architecture and conventions

### Tech stack
- Elysia framework
- Cloudflare D1 via Wrangler
- Drizzle ORM and Drizzle Kit
- Better Auth for authentication
- Valibot for schema validation
- `neverthrow` for safer error handling
- `better-ts-enum` for shared enum definitions

### Auth and request flow
- Primary auth is Better Auth session cookies, mounted under `/api/better-auth/*`.
- The backend uses cookie session auth in production.
- Tests often simulate auth by sending `x-user-id`, `x-user-role`, and related headers; inspect `apps/backend/src/*/*.test.ts` to see examples. Review the test fixtures (`dist/__tests__/setup.js` or source test helpers) to understand how tests provide a test DB and auth context. IMPORTANT: the test suite is currently outdated and unreliable — do not rely on test outputs, fixtures, or assertions until the tests are updated; treat information derived from tests as irrelevant until fixed.
- `apps/backend/src/shared/` contains shared route helpers (for example `route-error.ts`, `route-prefixes.ts`, `schema.ts`) and `apps/backend/src/utils/` contains runtime helpers like `auth.ts` and `db.ts`.

### API style
- Feature modules follow a pattern: `model.ts`, `route.ts`, `schema.ts`, `validation.ts`.
- Shared validation and contract types belong in `packages/shared/validation`.
- Routes should return structured errors and use any shared route error normalization helpers.
- Use strict parsing for numeric path/query values.
- Access control should use shared helpers like self/admin checks.

### Database and data model
- The DB backend is Cloudflare D1.
- `drizzle.config.ts` defines the database setup.
- Runtime DB access is configured through `wrangler.jsonc` bindings.
- Local D1 development uses `.wrangler/state/v3/d1`.
- `apps/backend/scripts/seed.sql` seeds demo data.

### Feature coverage
- User auth and profile management
- Interest tracking and user interests
- Discovery and matching logic
- Likes and mutual-like handling
- Matches and chat messaging
- Subscriptions and tier tracking
- Admin logs and moderation auditing

---

## Frontend architecture and conventions

### Tech stack
- React 19.2
- Vite via `rolldown-vite`
- `@vitejs/plugin-react`
- React Router DOM for navigation
- TypeScript and Biome formatting

### Structure
- `apps/frontend/src/api/` should contain API request wrappers.
- `src/components/` is the UI component library.
- `src/pages/` contains page-level views.
- `src/context/`, `src/lib/`, and `src/utils/` are general helpers.
- The frontend imports shared validation and types from `@repo/shared`.

### Integration behavior
- The frontend is expected to consume backend API contracts.
- When backend routes change, update frontend API clients and data handling accordingly.
- Keep frontend and backend in sync through shared types whenever possible.

---

## Product intent / requirements

### High-level intention
The app is a meeting/social platform for students in a specific environment such as church or school. It is tailored for Babcock University students and supports:
- account registration and verification
- student profile creation with demographics and intent
- interest-based matching
- likes and mutual matches
- private messaging after a match
- subscription tiers for premium features
- admin moderation and audit logging

### Requirements sources
- `requirements/prototype-requirements.md`
- `requirements/extracted/requirements_pdf.txt`
- `requirements/extracted/requirements_srs_1.txt`
- `requirements/extracted/requirements_srs_2.txt`

These files contain the product vision, data model suggestions, and functional requirements that should guide feature design.

---

## Current repo state and known issues

### Implemented and working (verified in code)
- Better Auth is configured and mounted via `better-auth` in `apps/backend/src/utils/auth.ts`. Email OTP delivery is implemented via `EmailService` and verification/sign-in flows are enabled.
- Profile CRUD routes exist and enforce admin/self ownership checks at the route layer (`apps/backend/src/profiles/route.ts`).
- User-interests join table and routes are present and enforce admin/self checks (`apps/backend/src/user-interests/route.ts`).
- Likes and messages endpoints include participant/admin access checks; routes restrict writes/reads to authorized users (`apps/backend/src/likes/route.ts`, `apps/backend/src/messages/route.ts`).
- Frontend onboarding flow (`apps/frontend/src/pages/onboarding/SetupProfilePage.tsx`) creates profiles and persists interests to the join table using `useSaveProfileMutation` and `useUserInterests` mutations.
- Frontend hooks exist for canonical data: `useUserQuery`, `useProfileQuery`, `useUserInterestsQuery`, `useMatchesQuery`, and related mutations (`apps/frontend/src/hooks/*`).
- Recent frontend fixes: profile save/update mutations now update the `queryKeys.user()` cache so `RequireGuest`/`RequireVerified` route guards immediately see `profileComplete` after onboarding.

### In progress / newly discovered issues
- Frontend typecheck (`tsc -b`) fails because the backend imports `cloudflare:workers` types; without workspace-wide type mappings or adding the Cloudflare types package, `tsc` surfaces errors when run from frontend. This blocks a full `tsc -b` run across workspace without adding type shim or adjusting `tsconfig` build scope.

### Broken / remains to do (prioritized)
1. Wire message-read flow: `useMarkMessageReadMutation` exists and has been adjusted to accept an optional `matchId` and invalidate the match-specific `messages(matchId)` cache when provided, but it is not yet invoked by the UI when a user views an unread message. (File: `apps/frontend/src/hooks/useMatches.ts`) — TODO: call this when message list or chat view mounts and contains unread messages.
2. Message-read cache invalidation: Ensure the server returns sufficient info (e.g., `matchId`) on mark-read, or derive it client-side, and invalidate `queryKeys.messages(matchId)` and `queryKeys.matches()` for correct unread-count updates. (Front: `apps/frontend/src/hooks/useMatches.ts`, Back: `apps/backend/src/messages/route.ts`)
3. Backend ownership guard audit: While many routes use `isUserAdminOrSelf`, audit `apps/backend/src/user/route.ts` and other routes for any missing `await` usage or logic mistakes that could allow unauthorized actions. The initial plan flagged a missing `await` in `user/route.ts` — verify and patch if present.
4. Treaty / response-shape audit: Audit `useLikes`, `useDiscovery`, `useUsers` frontend hooks versus backend route response shapes to ensure the UI consumes the exact fields returned by the backend (avoid silent undefineds and runtime errors). Relevant files: `apps/frontend/src/hooks/useLikes.ts`, `apps/frontend/src/hooks/useDiscovery.ts`, `apps/frontend/src/hooks/useUsers.ts` and backend route handlers in `apps/backend/src/*/route.ts`.
5. Tests: Many route tests are outdated; add focused unit/integration tests for ownership guards and message mark-read behavior: `apps/backend/src/user/model.test.ts`, `apps/backend/src/user/route.test.ts`, `apps/backend/src/user-interests/route.test.ts`, `apps/backend/src/messages/route.test.ts`.
6. Documentation: Update `apps/backend/API_ROUTES.md` and remove stale notes in `apps/backend/README.md` (for example, an old `123456` email-verification note may remain). Also add a short recent-changes summary to `AGENTS.md` (see below).

### Recent changes (this working session)
- Patched frontend profile mutations so `onSuccess` updates `queryKeys.user()` (so route guards read `profileComplete` immediately). (File: `apps/frontend/src/hooks/useProfile.ts`)
- Adjusted `useMarkMessageReadMutation` to accept optional `matchId` and invalidate `queryKeys.messages(matchId)` when available; added a TODO to call it when the user views previously unread messages. (File: `apps/frontend/src/hooks/useMatches.ts`)
- Updated `AGENTS.md` to reflect the current implemention state and remaining tasks.

### Next actionable steps (recommended order)
1. Backend audit & fixes (ownership/await): `apps/backend/src/user/route.ts`, `apps/backend/src/profiles/route.ts`, `apps/backend/src/likes/route.ts`, `apps/backend/src/messages/route.ts`, `apps/backend/src/user-interests/route.ts`.
2. Wire message-read mutation in chat UI and ensure the server response includes `matchId` (or client derives it) so invalidation targets the right query keys.
3. Run a focused typecheck strategy: add `skipLibCheck` or provide `cloudflare:workers` ambient types to avoid workspace-wide tsc failures while iterating (or run `tsc -p apps/frontend/tsconfig.json` alone during frontend dev).
4. Audit treaty generated clients vs backend route responses and reconcile any mismatches.
5. Add/repair tests for ownership and message-read flows, then re-enable broader route tests after stabilization.
6. Update `apps/backend/API_ROUTES.md` and `apps/backend/README.md` to reflect live behavior and remove misleading TODOs.

### Quick verification commands
 - Frontend (dev):
```bash
cd apps/frontend
bun run dev
```

 - Frontend (typecheck only):
```bash
cd apps/frontend
bun run typecheck
```

 - Backend (dev / DB seed):
```bash
cd apps/backend
bun run onboard
bun run dev
```

 - Run backend tests (note: tests are flaky and may need updates):
```bash
bun run test --filter apps/backend
```

### Agent guidance updates
- When making changes, prefer small, isolated edits with typechecking and focused tests. Avoid changing auth/session behavior unless necessary. Use `queryKeys.user()` as the canonical cache key representing authenticated user + profile presence.

---

## Agent guidance

### When making changes
- Prefer small, incremental changes with tests.
- Keep TypeScript strictness and shared validation consistent.
- Do not change auth/session behavior lightly.
- Update both backend and frontend when shared API contracts evolve.
- Use `bun run check:write` before committing changes.
- Keep formatting consistent with Biome.

### Where to look first
- Backend API behavior: `apps/backend/src/`
- Backend auth / error handling helpers: `apps/backend/src/shared/` and `apps/backend/src/utils/`
- Shared validation and enums: `packages/shared/`
- Frontend integration and pages: `apps/frontend/src/`
- Product requirements: `requirements/`
- Current repo work items: `TODO.md`
- Endpoint docs: `apps/backend/API_ROUTES.md`

### Style expectations
- Use TypeScript modules, no CommonJS.
- Use Bun-native workflow and workspace imports.
- Keep file naming consistent with existing feature directories.
- Avoid introducing large new abstractions unless the current codebase explicitly needs them.

---

## Quick start for agents

1. Run `bun install` at repo root.
2. Install git hooks with `bun run hooks:setup`.
3. Start development:
   - `bun run dev`
4. For backend local DB setup:
   - `cd apps/backend && bun run onboard`
5. Run tests:
   - `bun run test`
6. Run formatting / lint:
   - `bun run check:write`

---

## Useful paths and files

- `apps/backend/src/index.ts`
- `apps/backend/src/index.ts`
- `apps/backend/src/shared/route-error.ts`
- `apps/backend/src/shared/route-prefixes.ts`
- `apps/backend/src/utils/auth.ts`
- `apps/backend/src/utils/db.ts`
- `apps/backend/drizzle.config.ts`
- `apps/backend/wrangler.jsonc`
- `apps/backend/API_ROUTES.md`
- `apps/frontend/src/api/`
- `apps/frontend/src/pages/`
- `apps/frontend/src/components/`
- `packages/shared/validation/`
- `requirements/prototype-requirements.md`
- `TODO.md`
