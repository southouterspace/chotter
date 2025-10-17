# Multi-stage Dockerfile for Hono API with Bun
# Stage 1: Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy root package.json and workspace configuration
COPY package.json bun.lockb ./

# Copy app-specific dependencies
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Copy workspace packages
COPY packages ./packages

# Install dependencies with frozen lockfile for reproducibility
RUN bun install --frozen-lockfile

# Copy application source code
COPY apps/api/src ./apps/api/src

# Build the application
WORKDIR /app/apps/api
RUN bun build ./src/index.ts --outdir ./dist --target bun

# Stage 2: Production runtime
FROM oven/bun:1 AS runtime

WORKDIR /app

# Copy only production dependencies and built artifacts
COPY --from=builder /app/apps/api/dist ./dist

# Metadata labels for Railway
LABEL org.opencontainers.image.description="Chotter API - Hono Server with Bun"
LABEL org.opencontainers.image.vendor="Chotter"

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:${PORT:-3000}/health').then(() => process.exit(0)).catch(() => process.exit(1))" || exit 1

# Environment variables (can be overridden)
ENV PORT=3000
ENV NODE_ENV=production
ENV BUN_ENV=production

# Expose port for Railway
EXPOSE 3000

# Run the application
CMD ["bun", "run", "dist/index.js"]
