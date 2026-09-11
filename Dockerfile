# ─── Stage 1: зависимости ────────────────────────────────────────────────────
FROM node:22.23-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate
# prepare → lefthook install не нужен в образе; esbuild/sharp — postinstall для сборки
RUN pnpm install --frozen-lockfile --ignore-scripts \
	&& pnpm rebuild esbuild sharp

# ─── Stage 2: сборка ─────────────────────────────────────────────────────────
FROM node:22.23-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Sharp-оптимизация ассетов (prebuild) + production-сборка Astro.
# Нельзя `pnpm exec astro build` — обходит lifecycle-хуки, prebuild не запускается.
RUN corepack enable && pnpm build && pnpm prune --prod --ignore-scripts

# ─── Stage 3: продакшн (минимальный образ) ────────────────────────────────────
FROM node:22.23-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init wget

RUN addgroup -g 1001 -S nodejs && adduser -S astro -u 1001

COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules

USER astro

ENV HOST=0.0.0.0 \
    PORT=4321 \
    NODE_ENV=production

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4321/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./dist/server/entry.mjs"]
