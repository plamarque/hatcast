# syntax=docker/dockerfile:1
# Image unique Cloud Run : Angular (Nginx) + API Spring sur 8081, Nginx écoute $PORT (défaut 8080).

# --- API (bootJar)
FROM eclipse-temurin:21-jdk-alpine AS api-build
WORKDIR /workspace/services/api
COPY services/api/ .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# --- Front (build production avec Client ID public)
FROM node:20-alpine AS web-build
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY legacy/package.json legacy/
COPY apps/web ./apps/web
RUN npm ci
ARG GOOGLE_OAUTH_WEB_CLIENT_ID
ENV GOOGLE_OAUTH_WEB_CLIENT_ID=${GOOGLE_OAUTH_WEB_CLIENT_ID}
RUN node apps/web/scripts/inject-google-client-id.mjs \
  && npm run build -w @hatcast/web -- --configuration production

# --- Runtime : Nginx + JRE + supervisord
FROM alpine:3.20
RUN apk add --no-cache \
  openjdk21-jre-headless \
  nginx \
  supervisor \
  gettext \
  curl

WORKDIR /app
COPY --from=api-build /workspace/services/api/build/libs/hatcast-api.jar /app/hatcast-api.jar
COPY --from=web-build /workspace/apps/web/dist/web/browser /usr/share/nginx/html

COPY deploy/v2/nginx.conf.template /etc/nginx/nginx.conf.template
COPY deploy/v2/supervisord.conf /etc/supervisord.conf
COPY deploy/v2/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV HATCAST_SERVER_PORT=8081
ENV HATCAST_SPRING_PROFILE=cloud

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
