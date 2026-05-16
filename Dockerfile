# syntax=docker/dockerfile:1
# ============================================================================
# COMPREHENSIVE PRODUCTION DOCKERFILE FOR NEXT.JS + PRISMA + NEXTAUTH ON EC2
# ============================================================================
# This Dockerfile is optimized for production deployment with:
# - Multi-stage builds for minimal image size
# - System dependencies installation
# - Prisma database client generation
# - Health checks
# - Security best practices
# - Clear documentation and comments
#
# Build: docker build -t super-code:latest .
# Run:   docker run -p 3000:3000 --env-file .env super-code:latest
# ============================================================================

# ============================================================================
# STAGE 1: BASE - Define base image and setup
# ============================================================================
FROM node:26-bookworm-slim AS base

# Set working directory
WORKDIR /app

# ---- System Dependencies Installation ----
# Install essential build tools, curl, git, and other utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials for native module compilation
    build-essential \
    python3 \
    # Git for version control operations
    git \
    # Network utilities
    curl \
    wget \
    # Required for database tools
    postgresql-client \
    # Additional utilities
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- pnpm Package Manager Setup ----
# Install pnpm directly instead of relying on corepack
RUN npm install -g pnpm@latest

# ---- Application Environment Variables ----
# These are build-time defaults; runtime values should be passed via -e or .env
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# ============================================================================
# STAGE 2: DEPENDENCIES - Install and cache dependencies
# ============================================================================
FROM base AS deps

# Copy package managers configuration and lock files
# This layer is cached until these files change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies with frozen lockfile (reproducible builds)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ============================================================================
# STAGE 3: BUILD - Build the application and Prisma client
# ============================================================================
FROM base AS build

# Copy cached node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy entire application source code
COPY . .

# ---- Prisma Client Generation ----
# This generates the Prisma client and fixes imports (see package.json)
# Required before building Next.js to ensure database types are available
RUN pnpm run generate

# ---- Next.js Build ----
# Builds the Next.js application for production
# Creates optimized output in .next directory
RUN pnpm run build

# ============================================================================
# STAGE 4: RUNTIME - Minimal production image
# ============================================================================
FROM base AS runner

# Security: Run as non-root user
RUN useradd -m -u 1001 nextuser

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build --chown=nextuser:nextuser /app/.next ./.next
COPY --from=build --chown=nextuser:nextuser /app/public ./public
COPY --from=build --chown=nextuser:nextuser /app/package.json ./package.json
COPY --from=build --chown=nextuser:nextuser /app/node_modules ./node_modules
COPY --from=build --chown=nextuser:nextuser /app/generated ./generated
COPY --from=build --chown=nextuser:nextuser /app/prisma ./prisma

# ---- Production Environment Variables ----
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Security Context ----
# Switch to non-root user for better security
USER nextuser

# Expose application port
EXPOSE 3000

# ---- Health Check ----
# Periodically check if the application is healthy
# Helps orchestration systems detect unhealthy containers
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/auth/providers || exit 1

# ---- Application Startup ----
# Start Next.js server
# Note: Ensure DATABASE_URL and AUTH_SECRET are provided at runtime
CMD ["node", "./node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
