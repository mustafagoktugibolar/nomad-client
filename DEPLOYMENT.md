# Deployment Guide

This guide explains how to build, push, and deploy the Nomad Client application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your machine and the server.
- A Docker Hub account (or other registry).
- **Important:** Replace `goktugibolar` with your actual Docker Hub username in the commands below and in `docker-compose.prod.yml`.

## 1. Build and Push (Local Machine)

Run these commands on your development machine to build the production image and push it to the registry.

```bash
# 1. Build the image (for standard Linux servers/Windows)
# IMPORTANT: Use --platform linux/amd64 if you are on a Mac (M1/M2) deploying to a standard server
docker build --platform linux/amd64 -t goktugibolar/nomad-client:1.1.1-hotfix .

# 2. Login to Docker Hub (if not already logged in)
docker login

# 3. Push the image to the registry
docker push goktugibolar/nomad-client:1.1.1-hotfix
```

## 2. Production Deployment (Server)

Run these commands on your production server.

1.  **Copy Files:** Copy `docker-compose.prod.yml` and `.env` (with production values) to your server.
2.  **Pull and Run:**

```bash
# 1. Pull the latest image
docker-compose -f docker-compose.prod.yml pull

# 2. Start the services
docker-compose -f docker-compose.prod.yml up -d
```

*Note: The `nginx-proxy` and `acme-companion` services will automatically handle SSL certificates for the domains specified in `docker-compose.prod.yml`.*

## 3. Development (Local Machine)

To run the application locally in development mode (with hot reloading):

```bash
# Run using the dev compose file
docker-compose -f docker-compose.dev.yml up --build
```

- The app will be available at `http://localhost:1907`.
- Changes to source files will automatically reload the page.
