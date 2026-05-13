#!/bin/bash
# Post-deployment script for AWS Amplify
# Run migrations after Amplify deployment completes
# Usage: bash post-deploy.sh

echo "🚀 Post-deployment setup starting..."
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable not set"
    echo ""
    echo "Instructions:"
    echo "1. Add DATABASE_URL to Amplify App Settings → Environment Variables"
    echo "2. Run this script again"
    exit 1
fi

echo "✓ DATABASE_URL is configured"
echo ""

# Install dependencies if needed
echo "Installing dependencies..."
pnpm install

echo ""
echo "Generating Prisma client..."
pnpm exec prisma generate

echo ""
echo "Running database migrations..."
pnpm exec prisma db push --skip-generate

echo ""
echo "✅ Post-deployment setup completed successfully!"
echo ""
echo "Your application is now ready to use."
