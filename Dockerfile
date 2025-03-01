##### DEPENDENCIES

FROM --platform=linux/amd64 node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./
COPY drizzle ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM --platform=linux/amd64 node:20-alpine AS builder
# Define build arguments - these must match GCP Cloud Run environment variables
ARG DATABASE_URL
ARG NEXT_PUBLIC_MAPS_KEY
ARG NEXTAUTH_URL
ARG AUTH_SECRET
ARG AUTH_DISCORD_ID
ARG AUTH_DISCORD_SECRET
ARG AUTH_TRUST_HOST
ARG NODE_ENV=production

# Set environment variables for build time
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_MAPS_KEY=${NEXT_PUBLIC_MAPS_KEY}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV NEXTAUTH_SECRET=${AUTH_SECRET}
ENV AUTH_DISCORD_ID=${AUTH_DISCORD_ID}
ENV AUTH_DISCORD_SECRET=${AUTH_DISCORD_SECRET}
ENV AUTH_TRUST_HOST=${AUTH_TRUST_HOST}
ENV NODE_ENV=${NODE_ENV}
ENV SKIP_ENV_VALIDATION=1

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
    if [ -f yarn.lock ]; then yarn build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### RUNNER

FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

# The distroless image doesn't need ARGs since it receives env vars from Cloud Run
# But we need to set the defaults for the ENV vars

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port
EXPOSE ${PORT}

CMD ["server.js"]
