# Truffle - Smoke Test Console

Truffle is a tiny, deployable Bun + React app meant to one-shot a demo deploy in the cloud and prove app + Postgres + migrations are alive. It records specimens (projects), deployments, and checks with a minimal dashboard and API.

## What It Exercises

- App runtime boot
- Postgres connectivity
- Schema migration
- Seed data creation
- Basic CRUD writes and reads
- Health and readiness endpoints

## Development

```bash
bun install
bun run db:migrate
bun run db:seed
bun run dev
```

Visit http://localhost:3000

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |

## Endpoints

- `GET /api/healthz`
- `GET /api/readyz`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/deployments`
- `POST /api/deployments`
- `GET /api/checks`
- `POST /api/checks`

## Migrations

Migration SQL lives in `src/db/migrations`. Apply with:

```bash
bun run db:migrate
```

## Seed

```bash
bun run db:seed
```
