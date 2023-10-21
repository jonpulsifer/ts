FROM node:18-alpine@sha256:435dcad253bb5b7f347ebc69c8cc52de7c912eb7241098b920f2fc2d7843183d
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && yarn global add pnpm turbo

FROM base as builder
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

# Uncomment and use build args to enable remote caching
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# Build the project
RUN turbo run build --filter=${APP}

FROM cgr.dev/chainguard/node:18@sha256:af073516c203b6bd0b55a77a806a0950b486f2e9ea7387a32b0f41ea72f20886 AS runner
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
