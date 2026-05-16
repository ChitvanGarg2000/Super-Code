#!/bin/bash
# ============================================================================
# SUPER CODE - Docker Compose Setup Script
# ============================================================================
# This script automates the setup process for deploying Super Code
# Usage: bash setup.sh
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SUPER CODE - Docker Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================================
# 1. Check Prerequisites
# ============================================================================
echo -e "${YELLOW}[1/5] Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

if ! command -v openssl &> /dev/null; then
    echo -e "${RED}✗ OpenSSL is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ OpenSSL installed${NC}"

# ============================================================================
# 2. Create .env File
# ============================================================================
echo ""
echo -e "${YELLOW}[2/5] Setting up environment file...${NC}"

if [ -f .env ]; then
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Skipping .env creation${NC}"
        SKIP_ENV=true
    fi
fi

if [ "$SKIP_ENV" != "true" ]; then
    # Generate secure secrets
    AUTH_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Create .env file
    cat > .env <<EOF
# ============================================================================
# SUPER CODE ENVIRONMENT CONFIGURATION
# ============================================================================
# Generated on: $(date)
# 
# IMPORTANT: Update these values with your actual credentials!
# ============================================================================

# APPLICATION
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# DATABASE
DB_USER=supercode_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=supercode_db
DATABASE_URL=postgresql://supercode_user:$DB_PASSWORD@db:5432/supercode_db

# NEXTAUTH
AUTH_SECRET=$AUTH_SECRET
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# OAUTH - GitHub
# Create at: https://github.com/settings/developers
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# OAUTH - Google
# Create at: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
EOF
    
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please update the following in .env:${NC}"
    echo "   - AUTH_URL (change from localhost:3000 if needed)"
    echo "   - GITHUB_ID and GITHUB_SECRET"
    echo "   - GOOGLE_CLIENT_ID and GOOGLE_SECRET"
fi

# ============================================================================
# 3. Build Docker Image
# ============================================================================
echo ""
echo -e "${YELLOW}[3/5] Building Docker image...${NC}"

if docker compose build; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi

# ============================================================================
# 4. Start Services
# ============================================================================
echo ""
echo -e "${YELLOW}[4/5] Starting services...${NC}"

if docker compose up -d; then
    echo -e "${GREEN}✓ Services started${NC}"
    
    # Wait for services to be ready
    echo -e "${BLUE}Waiting for services to be healthy...${NC}"
    sleep 5
    
    # Check service status
    docker compose ps
else
    echo -e "${RED}✗ Failed to start services${NC}"
    exit 1
fi

# ============================================================================
# 5. Run Migrations
# ============================================================================
echo ""
echo -e "${YELLOW}[5/5] Setting up database...${NC}"

echo -e "${BLUE}Waiting for database to be ready...${NC}"
sleep 10

if docker compose exec -T web pnpm prisma migrate deploy; then
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${YELLOW}⚠ Database migrations encountered an issue${NC}"
    echo "You may need to run manually: docker compose exec web pnpm prisma migrate deploy"
fi

# ============================================================================
# Success Summary
# ============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Application is running at:${NC}"
echo "  - http://localhost:3000"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  - View logs:        docker compose logs -f web"
echo "  - Stop services:    docker compose down"
echo "  - Restart services: docker compose restart"
echo "  - Database shell:   docker compose exec db psql -U supercode_user -d supercode_db"
echo "  - Prisma Studio:    docker compose exec web pnpm prisma studio"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Update .env with your OAuth credentials"
echo "  2. Open http://localhost:3000 in your browser"
echo "  3. For production deployment, see: DOCKER_DEPLOYMENT_GUIDE.md"
echo ""
