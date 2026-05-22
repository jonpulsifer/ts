FROM node:24-alpine@sha256:2bdb65ed1dab192432bc31c95f94155ca5ad7fc1392fb7eb7526ab682fa5bf14 AS base
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
