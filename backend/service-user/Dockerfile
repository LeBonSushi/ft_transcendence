FROM node:24-alpine AS builder

WORKDIR /app

# Copy shared module first
COPY ./shared /shared

# Copy package files from service directory
COPY ./backend/service-user/package.json ./
COPY ./backend/service-user/tsconfig.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY ./backend/service-user .

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files from builder
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3003

# Start the service
CMD ["node", "dist/main.js"]
