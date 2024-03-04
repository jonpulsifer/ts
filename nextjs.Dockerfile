FROM node:20-alpine@sha256:f4c96a28c0b2d8981664e03f461c2677152cd9a756012ffa8e2c6727427c2bda AS base
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
RUN mkdir -p ./apps/${APP}/.next/cache

WORKDIR /app/apps/${APP}
CMD ["server.js"]
