# Stage 1: Build stage
FROM node:19.6-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for prisma generation
RUN npm ci

# Copy Prisma files and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Stage 2: Prune dependencies
FROM node:19.6-alpine AS pruner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Aggressively prune dependencies and remove unnecessary files
RUN npm prune --production && \
    rm -rf node_modules/@prisma/engines* && \
    rm -rf node_modules/prisma && \
    rm -rf node_modules/@prisma/client/*.d.ts && \
    rm -rf node_modules/@prisma/client/*.md && \
    rm -rf node_modules/typescript && \
    find . -type f -name "*.map" -delete && \
    find . -type f -name "*.ts" -delete && \
    find . -type f -name "*.md" -delete && \
    find . -type d -name "examples" -exec rm -rf {} + && \
    find . -type d -name "example" -exec rm -rf {} + && \
    find . -type d -name "docs" -exec rm -rf {} + && \
    find . -type d -name "test" -exec rm -rf {} + && \
    find . -type d -name "tests" -exec rm -rf {} + && \
    find . -type f -name "CHANGELOG*" -delete && \
    find . -type f -name "README*" -delete && \
    find . -type f -name "LICENSE*" -delete

# Stage 3: Production stage
FROM node:19.6-alpine AS production

# Add dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

ENV NODE_ENV production

# Create non-root user with lowest privileges
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /usr/src/app

# Copy only the necessary files
COPY --from=pruner --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs index.js ./

USER nodejs

EXPOSE 4000

CMD ["dumb-init", "node", "index.js"]