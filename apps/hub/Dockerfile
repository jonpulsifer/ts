FROM node:24-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS base
ARG BUN_VERSION=1.3.10
RUN apk add --no-cache curl bash \
  && curl -fsSL https://bun.sh/install | bash -s -- --version ${BUN_VERSION}
ENV PATH="/root/.bun/bin:${PATH}"

FROM base AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN bun install --frozen-lockfile

FROM base AS production-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun install --production --frozen-lockfile

FROM base AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bun run build

FROM base
COPY ./package.json bun.lock /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["bun", "run", "start"]
