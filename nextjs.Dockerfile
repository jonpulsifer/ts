FROM node:20-alpine@sha256:eca3b795767baded421fb73ef18f2fdb47c87fd3e53d093148cbc8275e03c9fa AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && yarn global add pnpm turbo

FROM base AS builder
ENV TURBO_TELEMETRY_DISABLED=1
ARG APP
WORKDIR /app
COPY . .
RUN turbo prune --scope=${APP} --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ARG APP
ENV IS_DOCKER=1
ENV NEXT_TELEMETRY_DISABLED 1
ENV TURBO_TELEMETRY_DISABLED 1
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-* ./
RUN pnpm install --frozen-lockfile --filter=${APP}...

COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out ./out
COPY .prettierrc.json .

# Build the project
RUN \
  --mount=type=secret,id=TURBO_TOKEN \
  --mount=type=secret,id=TURBO_TEAM \
  --mount=type=secret,id=DATABASE_URL \
  --mount=type=secret,id=REDIS_URL \
  TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN) \
  TURBO_TEAM=$(cat /run/secrets/TURBO_TEAM) \
  DATABASE_URL=$(cat /run/secrets/DATABASE_URL) \
  REDIS_URL=$(cat /run/secrets/REDIS_URL) \
  turbo run build --filter=${APP}...

FROM cgr.dev/chainguard/node:20@sha256:f30d39c6980f0a50119f2aa269498307a80c2654928d8e23bb25431b9cbbdc4f AS runner
ARG APP
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app

COPY --from=installer /app/apps/${APP}/next.config.js .
COPY --from=installer /app/apps/${APP}/package.json .
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/.next/standalone ./
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/public ./apps/${APP}/public
RUN mkdir -p ./apps/${APP}/.next/cache/fetch-cache

USER root
RUN chown -R 65532:65532 ./apps/${APP}/.next/cache/fetch-cache
USER 65532:65532

WORKDIR /app/apps/${APP}
CMD ["server.js"]
