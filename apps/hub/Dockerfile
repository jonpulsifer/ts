FROM node:22-alpine@sha256:605dc0b362bd1781359cf97eea543e082f28784408f85c37c19f612fcf46b83e AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine@sha256:605dc0b362bd1781359cf97eea543e082f28784408f85c37c19f612fcf46b83e AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine@sha256:605dc0b362bd1781359cf97eea543e082f28784408f85c37c19f612fcf46b83e AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine@sha256:605dc0b362bd1781359cf97eea543e082f28784408f85c37c19f612fcf46b83e
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]