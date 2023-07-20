FROM node:18.17.0-alpine@sha256:93d91deea65c9a0475507e8bc8b1917d6278522322f00c00b3ab09cab6830060 AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=request-headers --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18.17.0-alpine@sha256:93d91deea65c9a0475507e8bc8b1917d6278522322f00c00b3ab09cab6830060 AS installer
RUN apk add --no-cache libc6-compat
RUN yarn global add pnpm turbo
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-* ./
RUN pnpm i

# Build the project
COPY --from=builder /app/out/full/ .
COPY .prettierrc.json .
COPY --from=builder /app/out ./out
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN turbo run build --scope=request-headers --include-dependencies --no-deps

FROM cgr.dev/chainguard/node:18.17.0@sha256:ede7ef4ca485553f5313f7a02ad3537db1fe337079fc7cfb879f44cf709326db AS runner
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app

COPY --from=installer /app/apps/request-headers/next.config.js .
COPY --from=installer /app/apps/request-headers/package.json .
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/.next/standalone ./
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/.next/static ./apps/request-headers/.next/static
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/public ./apps/request-headers/public

CMD ["apps/request-headers/server.js"]
