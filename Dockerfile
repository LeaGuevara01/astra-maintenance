ARG NODE_IMAGE
ARG CADDY_IMAGE
FROM ${NODE_IMAGE} AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY prisma prisma
RUN npm install --global npm@11.6.2 && npm ci
COPY apps apps
RUN npm run db:generate && npm run build

FROM build AS api
ARG GIT_COMMIT=unknown
LABEL org.opencontainers.image.revision=$GIT_COMMIT
ENV GIT_COMMIT=${GIT_COMMIT} NODE_ENV=production PORT=4301 HOST=0.0.0.0
USER node
EXPOSE 4301
CMD ["npm","run","start","--workspace","@astra/api"]

FROM ${CADDY_IMAGE} AS web
ARG GIT_COMMIT=unknown
LABEL org.opencontainers.image.revision=$GIT_COMMIT
COPY --from=build /app/apps/web/dist /srv
EXPOSE 8080 8443
