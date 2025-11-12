FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && yarn global add pnpm turbo@2

FROM base AS builder
ENV TURBO_TELEMETRY_DISABLED=1
ARG APP
WORKDIR /app
COPY . .
RUN turbo prune --scope=${APP} --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ARG APP
ENV STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-* ./
RUN pnpm install --frozen-lockfile --prod --no-optional --filter=${APP}...

# Build the project
COPY --from=builder /app/out/full/ .
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

FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe AS runner
ARG APP
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=installer /app/apps/${APP}/next.config.* .
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
