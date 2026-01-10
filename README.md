# App-Meeting

A meeting app built for meeting new people on a specific environment (e.g. school, church).

## Monorepo (Turborepo) Dev Setup

This repository is a monorepo managed with Turborepo and Bun workspaces (`apps/*`, `packages/*`).

### Prerequisites

- **Bun** (see `package.json` `packageManager`)
- **Git**

### Install dependencies

From the repo root:

- Install:
  - `bun install`

### Enable repo git hooks (required for commits)

This repo uses a repo-local hooks directory (`.githooks/`). You must enable it once on your machine:

- `bun run hooks:setup`

This installs a **pre-commit** hook that runs Biome on **staged** files (`biome check --write --staged`) and re-stages changes automatically.

### Common commands

Run from the repo root:

- Dev (all apps):
  - `bun run dev`

- Build (all packages/apps):
  - `bun run build`

- Typecheck (all packages/apps):
  - `bunx turbo run typecheck`

- Lint (all packages/apps):
  - `bun run lint`

- Format + lint (recommended for CI and before pushing):
  - Check everything (no writes): `bun run check`
  - Fix everything: `bun run check:write`
  - Fix staged files only: `bun run check:staged`

## CI recommendation

To ensure formatting isn’t bypassed (e.g. if hooks are skipped), CI should run:

- `bun install`
- `bun run check`
- `bunx turbo run typecheck`
- `bunx turbo run build`
