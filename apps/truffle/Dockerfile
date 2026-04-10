# syntax=docker/dockerfile:1@sha256:2780b5c3bab67f1f76c781860de469442999ed1a0d7992a5efdf2cffc0e3d769
FROM oven/bun:1-alpine@sha256:26d8996560ca94eab9ce48afc0c7443825553c9a851f40ae574d47d20906826d
WORKDIR /app
RUN apk add --no-cache tini

COPY apps/truffle/package.json package.json
COPY bun.lock bun.lock
RUN bun install

COPY apps/truffle/src src
COPY apps/truffle/styles styles
COPY apps/truffle/bunfig.toml bunfig.toml
COPY apps/truffle/tsconfig.json tsconfig.json

ENV NODE_ENV=production
ENV PORT=3000

# nonroot user (uid=65532) — matches RGD securityContext runAsUser
USER 65532:65532
EXPOSE 3000/tcp
ENTRYPOINT ["/sbin/tini", "--", "bun", "src/index.ts"]
