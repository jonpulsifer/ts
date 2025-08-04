FROM node:22-alpine@sha256:f9a425f0ef0b8ab90c7be73eb85cc3a5ae37cfefd3c315db1d787c58eef44fad AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine@sha256:f9a425f0ef0b8ab90c7be73eb85cc3a5ae37cfefd3c315db1d787c58eef44fad AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine@sha256:f9a425f0ef0b8ab90c7be73eb85cc3a5ae37cfefd3c315db1d787c58eef44fad AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine@sha256:f9a425f0ef0b8ab90c7be73eb85cc3a5ae37cfefd3c315db1d787c58eef44fad
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]