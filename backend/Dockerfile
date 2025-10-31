# Multi-stage Dockerfile for Solopreneur backend (TypeScript)
# Uses a build stage to install dev deps and compile TypeScript, then a smaller runtime image

FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install build tools needed for some native modules (argon2, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package manifests first (leverage Docker cache)
COPY package.json package-lock.json* ./

# Install all dependencies (dev + prod) for the build
RUN npm ci --silent

# Copy source and compile
COPY . .
RUN npm run build

# ---------- Runtime image
FROM node:18-bullseye-slim AS runner
WORKDIR /app

# Use non-root node user
RUN useradd --system --user-group --create-home nodeuser || true

ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json

RUN npm ci --omit=dev --silent

COPY --from=builder /app/dist ./dist

# Expose default backend port (adjust if you use a different port)
EXPOSE 3001

USER nodeuser

# Start the app
CMD ["node", "dist/main.js"]
