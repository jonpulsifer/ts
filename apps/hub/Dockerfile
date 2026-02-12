FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS development-dependencies-env
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY . /app
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm install --frozen-lockfile

FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS production-dependencies-env
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm install --prod --no-optional --frozen-lockfile

FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS build-env
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm run build

FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=10.28.2
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
CMD ["pnpm", "run", "start"]
