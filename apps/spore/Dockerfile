# syntax=docker/dockerfile:1@sha256:4a43a54dd1fedceb30ba47e76cfcf2b47304f4161c0caeac2db1c61804ea3c91
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS base
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
FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS runner
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
