FROM node:20-alpine AS deps
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Chromium for Puppeteer PDF generation (shipping labels, package inserts).
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/admin ./src/admin
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY deploy/docker/entrypoint-api.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p uploads/products uploads/cms-slides uploads/storefront-nav

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
