#!/bin/bash

# Configuration
# REPLACE THESE VALUES WITH YOUR OWN
HOST="YOUR_SERVER_IP"
USER="root"
KEY="/path/to/your/ssh_key.pem"
REMOTE_DIR="/var/www/nomad-client"

echo "🚀 Starting deployment to $HOST..."

# Check if key exists
if [ ! -f "$KEY" ]; then
    echo " SSH Key not found at $KEY"
    echo "Please ensure the key path is correct in the script."
    exit 1
fi

# Create remote directory
echo "📂 Creating remote directory..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$USER@$HOST" "mkdir -p $REMOTE_DIR"

# Sync files
echo "cw Syncing files..."
rsync -avz -e "ssh -i $KEY -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude '.DS_Store' \
    . \
    "$USER@$HOST:$REMOTE_DIR"

# Sync .env separately (ensure this file exists locally and is safe for prod)
if [ -f ".env" ]; then
    rsync -avz -e "ssh -i $KEY -o StrictHostKeyChecking=no" .env "$USER@$HOST:$REMOTE_DIR/.env"
else
    echo ".env file not found locally. Skipping sync."
fi

# Deploy
echo "Building and starting containers..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$USER@$HOST" "cd $REMOTE_DIR && docker rm -f nomad-client-prod || true && docker-compose -f docker-compose.prod.yml up --build -d"

echo "Deployment complete! App should be live at http://$HOST"
