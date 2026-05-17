# syntax=docker/dockerfile:1

# Multi-stage build for Next.js (standalone output)

FROM node:20-bookworm-slim AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --no-frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
# Prisma needs DATABASE_URL present for `prisma generate` (it does not need to be reachable).
ENV DATABASE_URL="mongodb://127.0.0.1:27017/dummy"

RUN pnpm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Render/Railway/Fly typically run behind a reverse proxy.
ENV AUTH_TRUST_HOST=true

# Next.js standalone server
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Prisma client is generated into /app/generated (custom output). Copy as a safety net.
COPY --from=builder /app/generated ./generated

USER node
EXPOSE 3000

CMD ["node", "server.js"]
