# syntax=docker/dockerfile:1@sha256:4a43a54dd1fedceb30ba47e76cfcf2b47304f4161c0caeac2db1c61804ea3c91
FROM oven/bun:1-alpine@sha256:7ed9f74c326d1c260abe247ac423ccbf5ac92af62bb442d515d1f92f21e8ea9b
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
