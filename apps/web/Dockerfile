# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

ARG VITE_API_URL
ARG VITE_MAPBOX_TOKEN
ARG VITE_POSTHOG_KEY
ARG VITE_SENTRY_DSN

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN pnpm --filter @metriva/shared build
RUN pnpm --filter @metriva/web build

# ---- Serve stage (nginx) ----
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
