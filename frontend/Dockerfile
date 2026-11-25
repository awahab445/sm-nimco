FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CURRENCY=PKR
ARG NEXT_PUBLIC_STORE_THEME=mehfil_shereen
ARG NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER=home-page-layout
ARG NEXT_PUBLIC_STORE_EMAIL=

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CURRENCY=$NEXT_PUBLIC_CURRENCY
ENV NEXT_PUBLIC_STORE_THEME=$NEXT_PUBLIC_STORE_THEME
ENV NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER=$NEXT_PUBLIC_STOREFRONT_HOME_LAYOUT_IDENTIFIER
ENV NEXT_PUBLIC_STORE_EMAIL=$NEXT_PUBLIC_STORE_EMAIL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# `next start` reads next.config.ts at runtime (image remotePatterns, poweredByHeader, …);
# it evaluates the same env vars as the build, so pass them through.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Drop build-time webpack/fetch caches so the container starts clean.
RUN rm -rf .next/cache

EXPOSE 3001
CMD ["npm", "run", "start"]
