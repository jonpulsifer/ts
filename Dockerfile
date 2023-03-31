FROM node:alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=headerz --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer
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

RUN turbo run build --scope=headerz --include-dependencies --no-deps

FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app

COPY --from=installer /app/apps/headerz/next.config.js .
COPY --from=installer /app/apps/headerz/package.json .
COPY --from=installer --chown=65532:65532 /app/apps/headerz/.next/standalone ./
COPY --from=installer --chown=65532:65532 /app/apps/headerz/.next/static ./apps/headerz/.next/static
COPY --from=installer --chown=65532:65532 /app/apps/headerz/public ./apps/headerz/public

CMD ["apps/headerz/server.js"]
