# N7 Forge Webhook Editor

N7 Forge Webhook Editor is a React/Vite editor for composing polished Discord webhook embeds for a discord server. It includes a mobile Discord-style preview and a server-side send route so the Discord webhook URL never reaches the browser.

## What it includes

- Editable embed title and introduction
- Multiple rule sections with emoji labels and bullet-point content
- Footer and Discord channel mention fields
- Neutral Discord-dark styling with selectable embed colors
- Mobile-oriented live preview
- Secure webhook status and send flow
- Server-side validation through the OpenAPI-generated API client

## Project structure

```text
artifacts/
├── aster-mc-webhook-builder/   # React/Vite editor and live preview
└── api-server/                 # Express API and Discord webhook delivery
lib/
├── api-spec/                   # OpenAPI source of truth
├── api-client-react/           # Generated React Query hooks
└── api-zod/                    # Generated request validation
```

## Run locally

This repository uses pnpm workspaces.

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/aster-mc-webhook-builder run dev
```

The frontend expects the API server to be available through the configured Replit workflow and uses the generated API hooks for health, webhook status, and sending.

## Webhook configuration

Set the Discord webhook URL as a Replit Secret named:

```text
DISCORD_WEBHOOK_URL
```

Never commit the URL, put it in frontend environment variables, or paste it into source code. The API server reads the secret and sends validated Discord embed payloads with a server-side request.

## Editing the embed

The main editor is in:

```text
artifacts/aster-mc-webhook-builder/src/App.tsx
```

The visual system and responsive preview are in:

```text
artifacts/aster-mc-webhook-builder/src/index.css
```

The API contract is defined first in:

```text
lib/api-spec/openapi.yaml
```

If the API contract changes, regenerate the client and validation packages before typechecking the workspace.

## API routes

- `GET /api/healthz` — API health check
- `GET /api/webhook/status` — reports whether the webhook secret is configured
- `POST /api/webhook/send` — validates and sends one Discord embed through the server-side webhook

The send route accepts one embed with a title, description, color, fields, and optional footer. Each rule section is represented as a Discord embed field, keeping the final message readable on mobile Discord.

## Security notes

- No Discord bot token or Discord.js login is used.
- The webhook URL is never returned by the status endpoint.
- Request payloads are validated before they are sent to Discord.
- The frontend only receives safe configuration status and send results.