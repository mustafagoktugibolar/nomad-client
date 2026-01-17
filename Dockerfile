# Multi-stage build for React Vite application with security

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Create non-root user for build process
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production=false --audit-level high

# Copy source code with proper ownership
COPY --chown=nextjs:nodejs . .

# Ensure the app directory is owned by the non-root user
RUN chown nextjs:nodejs /app

# Build arguments
ARG VITE_MAPBOX_ACCESS_TOKEN
ARG VITE_API_BASE
ENV VITE_MAPBOX_ACCESS_TOKEN=$VITE_MAPBOX_ACCESS_TOKEN
ENV VITE_API_BASE=$VITE_API_BASE

# Switch to non-root user for build
USER nextjs

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx (security hardened)
FROM nginx:alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Create nginx user if not exists
RUN addgroup -g 101 -S nginx || true
RUN adduser -S nginx -u 101 -G nginx || true

# Remove default nginx config and unnecessary files
RUN rm -rf /etc/nginx/conf.d/default.conf \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Copy built application from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
