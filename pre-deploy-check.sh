#!/bin/bash
# AWS Amplify Deployment Pre-Check Script
# Run this before deploying to AWS Amplify

echo "🚀 AWS Amplify Deployment Pre-Check"
echo "====================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  Node.js version: $NODE_VERSION"
    if [[ $NODE_VERSION == v18.* ]] || [[ $NODE_VERSION == v19.* ]] || [[ $NODE_VERSION == v20.* ]]; then
        echo "  ✅ Node.js version is compatible"
    else
        echo "  ⚠️  Warning: Recommended Node.js 18+"
    fi
else
    echo "  ❌ Node.js not found"
    exit 1
fi
echo ""

# Check pnpm
echo "✓ Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "  pnpm version: $PNPM_VERSION"
    echo "  ✅ pnpm is installed"
else
    echo "  ❌ pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi
echo ""

# Check Git
echo "✓ Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "  $GIT_VERSION"
    echo "  ✅ Git is installed"
else
    echo "  ❌ Git not found"
    exit 1
fi
echo ""

# Check required files
echo "✓ Checking required files..."
FILES_TO_CHECK=(
    "package.json"
    "next.config.ts"
    "prisma/schema.prisma"
    "amplify.yml"
    ".amplifyignore"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
    fi
done
echo ""

# Check environment variables locally
echo "✓ Checking for .env.local..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local exists (will be ignored in production)"
else
    echo "  ℹ️  .env.local not found (expected - use Amplify console for production vars)"
fi
echo ""

# Build test
echo "✓ Testing local build..."
if pnpm run build > /dev/null 2>&1; then
    echo "  ✅ Build successful"
else
    echo "  ⚠️  Build failed. Run 'pnpm run build' to debug"
fi
echo ""

# Summary
echo "====================================="
echo "Pre-check complete!"
echo ""
echo "Next steps:"
echo "1. Push code to Git repository (GitHub, GitLab, Bitbucket, CodeCommit)"
echo "2. Go to AWS Amplify Console"
echo "3. Click 'Create app' → 'Host web app'"
echo "4. Connect your Git repository"
echo "5. Configure build settings and environment variables"
echo "6. Deploy!"
echo ""
echo "For detailed instructions, see: AWS_AMPLIFY_DEPLOYMENT.md"
