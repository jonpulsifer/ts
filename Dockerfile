FROM node:18.16.1-alpine@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=request-headers --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18.16.1-alpine@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS installer
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

FROM cgr.dev/chainguard/node:18.16.1@sha256:4e72fa5e4fb8d0c08d2f8c35271f6d15ac819dc5eb96b6f844e592867e2986ea AS runner
WORKDIR /app

COPY --from=installer /app/apps/request-headers/next.config.js .
COPY --from=installer /app/apps/request-headers/package.json .
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/.next/standalone ./
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/.next/static ./apps/request-headers/.next/static
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/public ./apps/request-headers/public

CMD ["apps/request-headers/server.js"]
