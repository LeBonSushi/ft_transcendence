# Multi-stage build for Next.js
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY . .

# Build arguments for Next.js
ARG NEXTAUTH_SECRET
ARG AUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

# Export as environment variables for the build
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build Next.js app
RUN pnpm --filter web build

# Production stage
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Nginx and openssl instalation
RUN apk add --no-cache nginx openssl bash

COPY docker/frontend_entrypoint.sh /entrypoint.sh
COPY docker/nginx.conf /etc/nginx/nginx.conf

RUN chmod +x /entrypoint.sh

# CA ssl generation below before launch the server certificate creation script
RUN mkdir -p /ssl/ca

# 1. Generate the CA private key
#    - '/ssl/ca/travel_planner-ca.key': RSA 4096-bit private key for the CA
#    - Used to sign server certificates
RUN openssl genrsa -out "/ssl/ca/travel_planner-ca.key" 4096

# 2. Generate the self-signed CA certificate
#    - '/ssl/ca/travel_planner-ca.crt': CA certificate, valid for 10 years
#    - This is the file to import into the browser / OS trust store
RUN openssl req -new -x509 \
  -key "/ssl/ca/travel_planner-ca.key" \
  -out "/ssl/ca/travel_planner-ca.crt" \
  -days 3650 \
  -subj "/CN=TRVPLN-CA/O=TravelPlanner/C=FR"

EXPOSE 443 80

ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENTRYPOINT [ "/entrypoint.sh" ]