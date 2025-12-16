# Multi-stage build for production
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY . .

# Generate Prisma Client
RUN cd packages/database && pnpm prisma generate

# Build backend
RUN pnpm --filter backend build

# Production stage
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

# Install production dependencies with proper symlinks
RUN pnpm install --frozen-lockfile --prod

# Copy built code and generated prisma client
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages ./packages

# Re-generate Prisma Client in production
RUN cd packages/database && pnpm prisma generate

EXPOSE 4000

CMD ["node", "apps/backend/dist/apps/backend/src/main.js"]
