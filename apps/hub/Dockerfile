FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]