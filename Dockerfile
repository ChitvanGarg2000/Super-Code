# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app

# pnpm via corepack (ships with Node 20)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Builds Next.js + generates Prisma client (see package.json)
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Runtime files
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/generated ./generated

EXPOSE 3000

CMD ["node", "./node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
