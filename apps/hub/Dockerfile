FROM node:22-alpine@sha256:0f2b9a8d6a7c915b006beeaf41c5675a3e92d7ba548bb9a42263a3cac1e15867 AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine@sha256:0f2b9a8d6a7c915b006beeaf41c5675a3e92d7ba548bb9a42263a3cac1e15867 AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine@sha256:0f2b9a8d6a7c915b006beeaf41c5675a3e92d7ba548bb9a42263a3cac1e15867 AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine@sha256:0f2b9a8d6a7c915b006beeaf41c5675a3e92d7ba548bb9a42263a3cac1e15867
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]