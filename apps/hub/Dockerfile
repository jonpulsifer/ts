FROM node:24-alpine@sha256:7b5a34685a2c783049dd76919cfec137b76f846151f0b6f855e539c833e219ac AS development-dependencies-env
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY . /app
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm install --frozen-lockfile

FROM node:24-alpine@sha256:7b5a34685a2c783049dd76919cfec137b76f846151f0b6f855e539c833e219ac AS production-dependencies-env
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm install --prod --no-optional --frozen-lockfile

FROM node:24-alpine@sha256:7b5a34685a2c783049dd76919cfec137b76f846151f0b6f855e539c833e219ac AS build-env
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm run build

FROM node:24-alpine@sha256:7b5a34685a2c783049dd76919cfec137b76f846151f0b6f855e539c833e219ac
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
CMD ["pnpm", "run", "start"]
