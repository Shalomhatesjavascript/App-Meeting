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

### Known work in progress
- Email verification flow is currently using a demo SMTP/OTP bypass.
- Likes, messages, and matches route tests are not fully complete.
- Backend route tests are generally aged and need review.
- There are outstanding design questions around the profile schema and interest model.
- Some route semantics and access control need tightening (for `/profiles/:id`, `/profiles/me`, messages route shapes).
- Pagination is missing in the `users` list endpoint.
- Some DB model decisions may be provisional and should be validated before heavy refactors.

### Important TODO items
- Replace demo email/OTP flow with real email delivery and persistent verification tokens.
- Add route tests for likes, messages, matches.
- Review interest table design and whether interests should remain a separate entity.
- Confirm if profile fields should merge into the user meta table.
- Optimize discovery/matching queries to reduce memory and database usage.

### Stability notes
- Backend route tests exist but are currently outdated and unreliable; do not rely on them for definitive API contracts. Assume information from tests is irrelevant until tests are fixed. Use `API_ROUTES.md` and the route handlers (`apps/backend/src/*/route.ts`) as the more reliable source of truth.
- `API_ROUTES.md` is the current frontend-facing contract documentation; update it when API behavior changes.
- The frontend README is mostly template content and may not reflect all custom app behavior.

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
