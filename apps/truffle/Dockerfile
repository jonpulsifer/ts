# syntax=docker/dockerfile:1@sha256:4a43a54dd1fedceb30ba47e76cfcf2b47304f4161c0caeac2db1c61804ea3c91
FROM oven/bun:1-alpine@sha256:7ed9f74c326d1c260abe247ac423ccbf5ac92af62bb442d515d1f92f21e8ea9b AS base
ARG TURBO_VERSION=2.8.20
ENV TURBO_TELEMETRY_DISABLED=1
RUN bun add -g turbo@${TURBO_VERSION}

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=truffle --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN bun install --frozen-lockfile
RUN \
  --mount=type=secret,id=TURBO_TOKEN \
  --mount=type=secret,id=TURBO_TEAM \
  TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN 2>/dev/null || true) \
  TURBO_TEAM=$(cat /run/secrets/TURBO_TEAM 2>/dev/null || true) \
  turbo run build --filter=truffle

FROM oven/bun:1-alpine@sha256:7ed9f74c326d1c260abe247ac423ccbf5ac92af62bb442d515d1f92f21e8ea9b AS runner
WORKDIR /app

COPY --from=installer --chown=1000:1000 /app/node_modules ./node_modules
COPY --from=builder --chown=1000:1000 /app/apps/truffle/src ./src
COPY --from=builder --chown=1000:1000 /app/apps/truffle/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

# bun user (uid=1000, gid=1000) — explicit for Kubernetes runAsUser/runAsGroup
USER 1000:1000
EXPOSE 3000
ENTRYPOINT ["bun", "run", "src/index.ts"]
