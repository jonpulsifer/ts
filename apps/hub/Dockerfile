FROM node:22-alpine@sha256:edaff7359149b451922a1ec148ceeba6cc8ba20411235f782f16329f41fe37e6 AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22-alpine@sha256:edaff7359149b451922a1ec148ceeba6cc8ba20411235f782f16329f41fe37e6 AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:22-alpine@sha256:edaff7359149b451922a1ec148ceeba6cc8ba20411235f782f16329f41fe37e6 AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine@sha256:edaff7359149b451922a1ec148ceeba6cc8ba20411235f782f16329f41fe37e6
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]