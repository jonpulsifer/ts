FROM node:22-alpine@sha256:96cc8323e25c8cc6ddcb8b965e135cfd57846e8003ec0d7bcec16c5fd5f6d39f AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && yarn global add pnpm turbo@2

FROM base AS pruner
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app
COPY . .
ARG APP
RUN turbo prune --scope=${APP} --docker

FROM base AS dependencies
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
ARG APP
RUN pnpm install --frozen-lockfile --filter=${APP}...

FROM base AS production-dependencies
WORKDIR /app
ARG APP
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/${APP}/node_modules ./apps/${APP}/node_modules
COPY --from=pruner /app/out/json/ .
RUN pnpm prune --prod

# Add lockfile and package.json's of isolated subworkspace
FROM base AS builder
ENV TURBO_TELEMETRY_DISABLED 1
WORKDIR /app
ARG APP

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/json/pnpm-* ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/${APP}/node_modules ./apps/${APP}/node_modules

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
WORKDIR /app/apps/${APP}

COPY --from=production-dependencies --chown=65532:65532 /app/node_modules /app/node_modules
COPY --from=production-dependencies --chown=65532:65532 /app/apps/${APP}/node_modules ./node_modules
COPY --from=builder --chown=65532:65532 /app/apps/${APP}/build ./build
COPY --from=builder --chown=65532:65532 /app/apps/${APP}/public ./public
COPY --from=pruner /app/out/json/ /app/

USER 65532:65532

WORKDIR /app/apps/${APP}
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["npm run start"]
