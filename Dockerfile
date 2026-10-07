# ================================
# Stage 1: Build
# ================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY . .

# Build-time Vite variables are baked into the static bundle.
# Leave VITE_API_URL empty to use the Nginx same-origin API proxy.
ARG VITE_API_URL
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID=uni-book-store-client

ENV VITE_API_URL=$VITE_API_URL \
    VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY \
    VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID

RUN npm run build

# ================================
# Stage 2: Runtime
# ================================
FROM nginx:1.29-alpine AS runtime

# Patch OS packages (e.g. openssl/libssl/libcrypto) so the image picks up
# security fixes that are not yet baked into the published base tag.
# Keeps the Trivy CRITICAL gate green.
RUN apk upgrade --no-cache

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
