FROM node:22-alpine@sha256:666d1e3f9af77c471deabf824addb8ea185ab6843637886d22250c1aff3aff2c AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine@sha256:666d1e3f9af77c471deabf824addb8ea185ab6843637886d22250c1aff3aff2c AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine@sha256:666d1e3f9af77c471deabf824addb8ea185ab6843637886d22250c1aff3aff2c AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine@sha256:666d1e3f9af77c471deabf824addb8ea185ab6843637886d22250c1aff3aff2c
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]