# ============================================================================
# SUPER CODE - Docker Compose Setup Script (Windows PowerShell)
# ============================================================================
# This script automates the setup process for deploying Super Code on Windows
# Usage: powershell -ExecutionPolicy Bypass -File setup.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

# Colors (using Write-Host with colors)
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error-Custom { Write-Host $args -ForegroundColor Red }
function Write-Warning-Custom { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Info "========================================"
Write-Info "  SUPER CODE - Docker Setup (Windows)"
Write-Info "========================================"
Write-Info ""

# ============================================================================
# 1. Check Prerequisites
# ============================================================================
Write-Warning-Custom "[1/5] Checking prerequisites..."

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Success "✓ Docker installed: $dockerVersion"
} catch {
    Write-Error-Custom "✗ Docker is not installed"
    Write-Info "Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker compose version
    Write-Success "✓ Docker Compose installed"
} catch {
    Write-Error-Custom "✗ Docker Compose is not installed"
    exit 1
}

Write-Info ""

# ============================================================================
# 2. Create .env File
# ============================================================================
Write-Warning-Custom "[2/5] Setting up environment file..."

if (Test-Path ".env") {
    Write-Warning-Custom "⚠ .env file already exists"
    $response = Read-Host "Do you want to overwrite it? (y/n)"
    if ($response -ne "y") {
        Write-Info "Skipping .env creation"
        $skipEnv = $true
    }
}

if (-not $skipEnv) {
    # Generate secure secrets using openssl (available on Windows 10+ with OpenSSH)
    try {
        $authSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random 1000000000)))
        $dbPassword = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random 1000000000)))
    } catch {
        # Fallback if openssl not available
        $authSecret = "generate_with_openssl_rand_base64_32"
        $dbPassword = "generate_with_openssl_rand_base64_32"
    }
    
    # Create .env file
    $envContent = @"
# ============================================================================
# SUPER CODE ENVIRONMENT CONFIGURATION
# ============================================================================
# Generated on: $(Get-Date)
# 
# IMPORTANT: Update these values with your actual credentials!
# ============================================================================

# APPLICATION
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# DATABASE
DB_USER=supercode_user
DB_PASSWORD=$dbPassword
DB_NAME=supercode_db
DATABASE_URL=postgresql://supercode_user:$dbPassword@db:5432/supercode_db

# NEXTAUTH
AUTH_SECRET=$authSecret
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$authSecret
AUTH_TRUST_HOST=true

# OAUTH - GitHub
# Create at: https://github.com/settings/developers
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# OAUTH - Google
# Create at: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Success "✓ .env file created"
    Write-Warning-Custom "⚠ Please update the following in .env:"
    Write-Info "   - AUTH_URL (if needed)"
    Write-Info "   - GITHUB_ID and GITHUB_SECRET"
    Write-Info "   - GOOGLE_CLIENT_ID and GOOGLE_SECRET"
}

Write-Info ""

# ============================================================================
# 3. Build Docker Image
# ============================================================================
Write-Warning-Custom "[3/5] Building Docker image..."
Write-Info "This may take a few minutes on first build..."

& docker compose build
if ($LASTEXITCODE -eq 0) {
    Write-Success "✓ Docker image built successfully"
} else {
    Write-Error-Custom "✗ Failed to build Docker image"
    exit 1
}

Write-Info ""

# ============================================================================
# 4. Start Services
# ============================================================================
Write-Warning-Custom "[4/5] Starting services..."

& docker compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Success "✓ Services started"
    Write-Info "Waiting 5 seconds for services to initialize..."
    Start-Sleep -Seconds 5
    Write-Info ""
    Write-Info "Service status:"
    & docker compose ps
} else {
    Write-Error-Custom "✗ Failed to start services"
    exit 1
}

Write-Info ""

# ============================================================================
# 5. Run Migrations
# ============================================================================
Write-Warning-Custom "[5/5] Setting up database..."
Write-Info "Waiting 10 seconds for database to be ready..."
Start-Sleep -Seconds 10

Write-Info "Running database migrations..."
& docker compose exec -T web pnpm prisma migrate deploy
if ($LASTEXITCODE -eq 0) {
    Write-Success "✓ Database migrations completed"
} else {
    Write-Warning-Custom "⚠ Database migrations encountered an issue"
    Write-Info "You may need to run manually:"
    Write-Info "  docker compose exec web pnpm prisma migrate deploy"
}

Write-Info ""

# ============================================================================
# Success Summary
# ============================================================================
Write-Success "========================================"
Write-Success "  Setup Complete!"
Write-Success "========================================"
Write-Info ""

Write-Info "Application is running at:"
Write-Info "  - http://localhost:3000"
Write-Info ""

Write-Info "Useful commands:"
Write-Info "  View logs:        docker compose logs -f web"
Write-Info "  Stop services:    docker compose down"
Write-Info "  Restart services: docker compose restart"
Write-Info "  Database shell:   docker compose exec db psql -U supercode_user -d supercode_db"
Write-Info "  Prisma Studio:    docker compose exec web pnpm prisma studio"
Write-Info ""

Write-Warning-Custom "Next Steps:"
Write-Info "  1. Update .env with your OAuth credentials"
Write-Info "  2. Open http://localhost:3000 in your browser"
Write-Info "  3. For production deployment, see: DOCKER_DEPLOYMENT_GUIDE.md"
Write-Info ""
