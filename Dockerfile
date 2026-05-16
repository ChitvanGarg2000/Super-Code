# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Generate Prisma client and fix imports
RUN pnpm run generate

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/generated ./generated

# Copy public directory if it exists
COPY public ./public

# Copy necessary config files
COPY next.config.ts ./
COPY prisma.config.ts ./

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"]
