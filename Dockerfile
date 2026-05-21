FROM oven/bun:alpine AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN CI= BUN_INSTALL_FROZEN_LOCKFILE= bun install --no-save

FROM oven/bun:alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --from=builder /app/package.json /app/bun.lock ./
RUN CI= BUN_INSTALL_FROZEN_LOCKFILE= bun install --production --no-save
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["bun", "run", "start"]
