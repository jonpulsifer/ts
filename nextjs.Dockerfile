FROM node:20-alpine@sha256:acdf232a7bf5d32e2212134d50aee7deb9193908f1172e56fc865c51b0c6bfb0 AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && yarn global add pnpm turbo

FROM base AS builder
ARG APP
# Set working directory
WORKDIR /app
COPY . .
RUN turbo prune --scope=${APP} --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ARG APP
ENV IS_DOCKER=1
ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-* ./
RUN pnpm install --frozen-lockfile --filter=${APP}...

COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out ./out
COPY .prettierrc.json .
#COPY turbo.json turbo.json

ENV DATABASE_URL postgres://postgres:postgres@postgres:5432/${APP:-postgres}?schema=public
ENV DATABASE_URL_NON_POOLING postgres://postgres:postgres@postgres:5432/${APP:-postgres}?schema=public&max_connections=1

# Build the project
RUN turbo run build --filter=${APP}

FROM cgr.dev/chainguard/node:20@sha256:f30d39c6980f0a50119f2aa269498307a80c2654928d8e23bb25431b9cbbdc4f AS runner
ARG APP
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app

COPY --from=installer /app/apps/${APP}/next.config.js .
COPY --from=installer /app/apps/${APP}/package.json .
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/.next/standalone ./
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/public ./apps/${APP}/public

WORKDIR /app/apps/${APP}
CMD ["server.js"]
