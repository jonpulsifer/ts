FROM node:22-alpine@sha256:3d5fc849018cfc7e3d770820582857fb6c8d88eb10db7d3af699e8cf81b9e551 AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine@sha256:3d5fc849018cfc7e3d770820582857fb6c8d88eb10db7d3af699e8cf81b9e551 AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine@sha256:3d5fc849018cfc7e3d770820582857fb6c8d88eb10db7d3af699e8cf81b9e551 AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine@sha256:3d5fc849018cfc7e3d770820582857fb6c8d88eb10db7d3af699e8cf81b9e551
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]