# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all deps (needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client and build
RUN pnpm --filter @metriva/shared build
RUN pnpm --filter @metriva/api prisma generate
RUN pnpm --filter @metriva/api build

# Prune dev deps
RUN pnpm --filter @metriva/api deploy --prod /app/deploy

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

# Copy pruned production bundle
COPY --from=builder /app/deploy ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Generate prisma client in production image
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use dumb-init so signals are forwarded to Node correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
