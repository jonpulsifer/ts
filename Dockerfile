FROM node:18-alpine@sha256:f5e1a1db3ab9a416cb6a5ccbc1bd2cdcfc0948793b058805852b75edb7610e74 AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && yarn global add pnpm turbo

FROM base AS builder
ARG APP
WORKDIR /app
COPY . .
RUN turbo prune --scope=${APP} --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ARG APP
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-* ./
RUN pnpm install --frozen-lockfile --filter=${APP}

# Uncomment and use build args to enable remote caching
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# Build the project
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out ./out
RUN turbo run build --filter=${APP}...

FROM cgr.dev/chainguard/node:18@sha256:af073516c203b6bd0b55a77a806a0950b486f2e9ea7387a32b0f41ea72f20886 AS runner
ARG APP
WORKDIR /app/apps/${APP}
COPY --from=installer --chown=65532:65532 /app/node_modules /app/node_modules
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/node_modules ./node_modules
COPY --from=installer --chown=65532:65532 /app/apps/${APP}/dist ./
CMD ["main.js"]
