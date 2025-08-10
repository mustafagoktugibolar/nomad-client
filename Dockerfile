# Multi-stage build for Vite + React (TypeScript) app
# 1) Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
# If you use pnpm / yarn, copy their lock files instead
RUN npm ci --no-audit --no-fund

# Copy the rest of the project
COPY . .

# Vite automatically loads variables starting with VITE_ from .env at build time.
# Removed ARG/ENV that previously overrode the .env token with an empty value if not passed.
# If you still want to override at build: docker build --build-arg VITE_MAPBOX_ACCESS_TOKEN=pk.xxxxx .
# Then uncomment the two lines below.
# ARG VITE_MAPBOX_ACCESS_TOKEN
# ENV VITE_MAPBOX_ACCESS_TOKEN=$VITE_MAPBOX_ACCESS_TOKEN

# Build the production bundle
RUN npm run build

# 2) Runtime stage (nginx serving static files)
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist ./

# Expose port (nginx default 80)
ENV NGINX_PORT=5000
RUN sed -i "s/listen       80;/listen       ${NGINX_PORT};/" /etc/nginx/conf.d/default.conf || true
EXPOSE 5000

# Healthcheck (simple HTTP check)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
