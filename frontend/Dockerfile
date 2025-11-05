# Multi-stage Dockerfile for Solopreneur frontend (Next.js)

# 1. Builder Stage: Install all dependencies and build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (necessary for performance optimization steps)
COPY package.json package-lock.json ./
RUN npm install --prefer-offline --no-audit

# Copy source code and build the Next.js application
COPY . .
RUN npm run build

# ---------- Runtime (Production) Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init to handle signals properly (Security/Reliability)
RUN apk add --no-cache dumb-init

# Use non-root user (Security-First Principle)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 1. Copy only Production Dependencies from builder (Optimization)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copy precompiled node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# 2. Copy Built Application Assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set ownership to the non-root user
RUN chown -R nextjs:nodejs /app

ENV NODE_ENV=production

# Expose port
EXPOSE 3000

USER nextjs

# Health check (Ensure the application is serving 200 OK)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals (Reliability)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]