# ============================================================================
# Spore - iPXE Boot Manager
# Simple Dockerfile for React Router 7 with WebSocket terminal
# ============================================================================

FROM node:24-alpine@sha256:cd6fb7efa6490f039f3471a189214d5f548c11df1ff9e5b181aa49e22c14383e

WORKDIR /app

# Install runtime dependencies for terminal
RUN apk add --no-cache dnsmasq bash python3 make g++

# Install pnpm
RUN npm install -g pnpm@latest

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/spore/package.json ./apps/spore/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/spore ./apps/spore

WORKDIR /app/apps/spore

# Build the React Router app
RUN pnpm react-router build

# Create storage directories
RUN mkdir -p /app/storage/isos /app/storage/tftpboot /app/data

# Environment
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/sqlite.db
ENV ISO_STORAGE_DIR=/app/storage/isos
ENV TFTP_ROOT_DIR=/app/storage/tftpboot
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the server using tsx in production mode
CMD ["pnpm", "tsx", "server.ts"]
