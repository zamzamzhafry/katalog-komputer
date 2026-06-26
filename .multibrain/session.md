# Multi-Brain Session Index — katalog-komputer

> Scan first. Pick bucket, read index, open context only if needed.

## Project

Next.js 14.2.5 catalog (laptop/PC) + admin dashboard. Supabase SSR (DB, Storage, Auth). WhatsApp order flow. Dark "spec-sheet" UI. `lib/*.ts` pure + tested (node --test). 5 commits on `main`. Vercel-deployed.

Path: `/home/user/projects/katalog-komputer`

## Active Agent

- **@claude (Claude Code)** — indexed knowledge for later UI/UX pro-max pass. Caveman full. No concurrent agents (unlike food-stall-pos). Working tree: only `.gitignore` (M).

## Buckets

- `ui` — Design system, palette, components, animation, a11y, mobile. PRIMARY bucket for upcoming work. -> indexes/ui.md
- `architecture` — Module depth, seams, dead code, god components. -> indexes/architecture.md
- `data` — Supabase schema/types, storage, image strategy, SSR fetch. -> indexes/data.md
- `agents` — Agent config, multibrain maintenance. -> indexes/agents.md
- `docs` — Truth sources, README, deferred ideas. -> indexes/docs.md

## Coordination rules

- Single-agent repo. Still: check `git status` before commit. `next-env.d.ts` regens on dev server — discard, don't commit.
- `tsconfig.tsbuildinfo` — build artifact, gitignored.
- Knowledge stores: `.multibrain/` (this) + `.graphify/` (not yet run) + agentmemory MCP. Obsidian vault at `/home/user/vm-setup/obsidian-vault`.
