# Elysia with Bun runtime

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

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## D1 Notes (Important)

- `.env` variables (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`) are for Drizzle CLI commands only (`drizzle.config.ts`, `db:*` scripts).
- Runtime DB access comes from Wrangler binding `env.DB` in `wrangler.jsonc`.
- `wrangler dev` uses a local D1 database file by default, which can be empty.
- Use `wrangler dev --remote` when you want development to hit the remote D1 database that already has schema/data.

### Local-first workflow (recommended)

- Reset local D1, apply migrations, and seed demo data:
	- `bun run db:local:setup` (alias of `db:local:reset`)
- Re-seed local D1 without reset:
	- `bun run db:local:seed`
- Start backend against local D1:
	- `bun run dev`