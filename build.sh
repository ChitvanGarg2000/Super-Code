#!/bin/bash

# ============================================================================
# BUILD SCRIPT FOR SUPER-CODE DOCKER IMAGE
# ============================================================================
# This script loads environment variables from .env and passes them as
# build arguments to Docker, enabling Prisma client generation during build.
#
# Usage: ./build.sh
# ============================================================================

# Exit on error
set -e

# Load environment variables from .env file
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create a .env file with the required environment variables."
    exit 1
fi

# Source the .env file
set -a
source .env
set +a

# Build the Docker image with environment variables as build arguments
echo "Building super-code Docker image..."
docker build \
    --build-arg NODE_ENV=production \
    --build-arg DATABASE_URL="$DATABASE_URL" \
    --build-arg AUTH_SECRET="$AUTH_SECRET" \
    --build-arg GITHUB_ID="$GITHUB_ID" \
    --build-arg GITHUB_SECRET="$GITHUB_SECRET" \
    --build-arg GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
    --build-arg GOOGLE_SECRET="$GOOGLE_SECRET" \
    -t super-code:latest \
    .

echo "✅ Build completed successfully!"
echo "To run the container:"
echo "  docker run -p 3000:3000 --env-file .env super-code:latest"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up"
