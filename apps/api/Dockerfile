# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests first (cache deps layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Compile shared package to JS (API requires it at runtime)
RUN pnpm --filter @metriva/shared build

# Generate Prisma client
RUN pnpm --filter @metriva/api exec prisma generate

# Build API using pnpm (handles workspace binary resolution)
RUN pnpm --filter @metriva/api build

# Show where dist ended up so we can verify the COPY path below
RUN find /app -name "main.js" -not -path "*/node_modules/*" 2>/dev/null && echo "=== dist found ==="

# Prune to production deps only
RUN pnpm --filter @metriva/api deploy --prod --legacy /app/deploy

# ---- Production stage ----
FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init openssl && rm -rf /var/lib/apt/lists/*

# Copy production node_modules + package files from deploy bundle
COPY --from=builder /app/deploy ./

# Copy compiled app — pnpm runs build scripts from the package dir so dist
# lands at apps/api/dist/; also try workspace root /app/dist as fallback
COPY --from=builder /app/apps/api/dist ./dist

# Copy Prisma schema for client generation
COPY --from=builder /app/apps/api/prisma ./prisma

# Regenerate Prisma client against the final image's openssl
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
# Run migrations then start — migrate deploy is a no-op if already applied
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
