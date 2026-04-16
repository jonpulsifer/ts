FROM node:24-alpine@sha256:8510330d3eb72c804231a834b1a8ebb55cb3796c3e4431297a24d246b8add4d5 AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
ARG BUN_VERSION=1.3.10
RUN apk add --no-cache libc6-compat curl bash \
  && curl -fsSL https://bun.sh/install | bash -s -- --version ${BUN_VERSION} \
  && /root/.bun/bin/bun add -g turbo@2.8.16
ENV PATH="/root/.bun/bin:${PATH}"

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
RUN bun install --frozen-lockfile

FROM base AS production-dependencies
WORKDIR /app
ARG APP
# Install production dependencies from the pruned workspace
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile --production

# Add lockfile and package.json's of isolated subworkspace
FROM base AS builder
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app
ARG APP

COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/bun.lock ./
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

FROM node:24-alpine@sha256:8510330d3eb72c804231a834b1a8ebb55cb3796c3e4431297a24d246b8add4d5
ARG TARGETPLATFORM
LABEL org.opencontainers.image.platform=$TARGETPLATFORM
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
