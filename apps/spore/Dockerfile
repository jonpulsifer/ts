# syntax=docker/dockerfile:1@sha256:2780b5c3bab67f1f76c781860de469442999ed1a0d7992a5efdf2cffc0e3d769
FROM node:24-alpine@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS base
ARG BUN_VERSION=1.3.10
RUN apk add --no-cache curl bash \
  && curl -fsSL https://bun.sh/install | bash -s -- --version ${BUN_VERSION}
ENV PATH="/root/.bun/bin:${PATH}"

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lock ./
COPY apps/spore/package.json ./apps/spore/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/spore/node_modules ./apps/spore/node_modules
COPY . .

# Build the application
RUN bun run build --filter=spore

# Production image with dnsmasq for TFTP
FROM node:24-alpine@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS runner
WORKDIR /app

# Install dnsmasq for TFTP support and supervisor
RUN apk add --no-cache dnsmasq supervisor

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create directories
RUN mkdir -p /var/lib/tftpboot /app/data /var/log/supervisor
RUN chown -R nextjs:nodejs /app /var/lib/tftpboot /var/log/supervisor

# Copy dnsmasq config
COPY --chown=nextjs:nodejs apps/spore/docker/dnsmasq.conf /etc/dnsmasq.conf
COPY --chown=nextjs:nodejs apps/spore/docker/supervisord.conf /etc/supervisord.conf

# Copy Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/spore/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/spore/.next/static ./apps/spore/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/spore/public ./apps/spore/public

# Default environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/spore.db"

# Expose ports: HTTP (3000), TFTP (69/udp)
EXPOSE 3000
EXPOSE 69/udp

# Use supervisor to run both Next.js and dnsmasq
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
