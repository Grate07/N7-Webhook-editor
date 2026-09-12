# N7 Forge Webhook Editor

A secure Discord webhook embed composer for editing, previewing, and sending N7 Forge server rules.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aster-mc-webhook-builder/src/App.tsx` — embed editor, default N7 Forge rules, live Discord preview, and send interaction.
- `artifacts/aster-mc-webhook-builder/src/index.css` — dark server-operations theme and responsive layout.
- `artifacts/api-server/src/routes/webhook.ts` — server-side Discord webhook status and send routes.
- `lib/api-spec/openapi.yaml` — source of truth for webhook API contracts.

## Architecture decisions

- The Discord webhook URL stays server-side; the browser sends only the validated embed payload.
- The editor uses Discord's embed field model so each rule section remains independently editable and mobile-readable.
- The live preview is client-rendered and mirrors the webhook payload assembled by the send action.

## Product

N7 Forge admins can edit a title, introduction, nine rule sections, support channel mention, footer, and embed accent color; preview the result in a Discord-style mobile frame; and send it through the configured webhook.

## Gotchas

- Keep `DISCORD_WEBHOOK_URL` in Replit Secrets; never expose it through frontend environment variables.
- Regenerate API hooks after changing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
