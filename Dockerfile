FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SF6_COOKIE
ARG DATABASE_URL

ENV SF6_COOKIE=$SF6_COOKIE
ENV DATABASE_URL=$DATABASE_URL

RUN yarn build

# Production image
FROM base AS runner
WORKDIR /app

ARG SF6_COOKIE
ARG DATABASE_URL

ENV SF6_COOKIE=$SF6_COOKIE
ENV DATABASE_URL=$DATABASE_URL

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
