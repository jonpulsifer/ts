FROM node:18.17.1-alpine@sha256:3482a20c97e401b56ac50ba8920cc7b5b2022bfc6aa7d4e4c231755770cf892f AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=request-headers --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18.17.1-alpine@sha256:3482a20c97e401b56ac50ba8920cc7b5b2022bfc6aa7d4e4c231755770cf892f AS installer
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

FROM cgr.dev/chainguard/node:18.17.1@sha256:fbaecf4d6ac9883699078c0b501aad22c866f9ce039d009212c0eed260914875 AS runner
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app

COPY --from=installer /app/apps/request-headers/next.config.js .
COPY --from=installer /app/apps/request-headers/package.json .
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/.next/standalone ./
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/.next/static ./apps/request-headers/.next/static
COPY --from=installer --chown=65532:65532 /app/apps/request-headers/public ./apps/request-headers/public

CMD ["apps/request-headers/server.js"]
