# Complete Docker Deployment Guide - Super Code on EC2

This guide provides complete instructions to deploy Super Code (Next.js + Prisma + NextAuth) on AWS EC2 using Docker and Docker Compose.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [EC2 Instance Setup](#ec2-instance-setup)
3. [Docker Installation](#docker-installation)
4. [Application Deployment](#application-deployment)
5. [Database Setup & Migrations](#database-setup--migrations)
6. [Environment Configuration](#environment-configuration)
7. [Production Considerations](#production-considerations)
8. [Monitoring & Logs](#monitoring--logs)
9. [Troubleshooting](#troubleshooting)
10. [Useful Commands](#useful-commands)

---

## Prerequisites

Before you start, ensure you have:

- AWS account with EC2 access
- SSH client (terminal/PowerShell)
- GitHub/GitLab repository URL for your code
- Domain name (optional but recommended for production)
- SSL certificate (Let's Encrypt or custom, for HTTPS)
- Required environment variables (see [Environment Configuration](#environment-configuration))

---

## EC2 Instance Setup

### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Instances → Launch Instance
2. **Choose AMI:** Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (free tier eligible)
3. **Instance Type:** t3.small or t3.medium (adjust based on expected traffic)
4. **Configure Security Group:**
   ```
   Inbound Rules:
   - SSH (port 22)    from YOUR_IP (restrict for security)
   - HTTP (port 80)   from 0.0.0.0/0
   - HTTPS (port 443) from 0.0.0.0/0
   - Custom (port 3000) from YOUR_IP (optional, for testing)
   ```
5. **Storage:** 30GB+ (adjust based on your needs)
6. **Key Pair:** Create or select, download `.pem` file (save securely)
7. **Launch** and wait for instance to be running

### Step 2: Connect to EC2 Instance

```bash
# On your local machine
chmod 600 /path/to/your-key.pem  # Set permissions (macOS/Linux)

# Connect via SSH
ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

**Windows Users:** Use PuTTY or WSL with the SSH command above.

---

## Docker Installation

Once connected to your EC2 instance, run the following commands:

### Step 1: Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Step 2: Install Required Packages

```bash
sudo apt-get install -y \
  ca-certificates \
  curl \
  git \
  wget \
  vim
```

### Step 3: Install Docker Engine

```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com | sudo sh

# Add current user to docker group (allows running docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### Step 4: Install Docker Compose

```bash
# Download latest Docker Compose binary
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker compose version
```

### Step 5: Verify Docker Installation

```bash
docker run hello-world
docker compose --version
```

---

## Application Deployment

### Step 1: Clone Repository

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/super-code.git
cd super-code
```

### Step 2: Create Environment File

Create a `.env` file in the project root with all required environment variables:

```bash
nano .env
```

Paste the following template and update with your values:

```env
# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
# Database credentials (must match docker-compose.yml)
DB_USER=supercode_user
DB_PASSWORD=your_secure_password_here_change_this
DB_NAME=supercode_db

# Prisma Database URL (format: postgresql://user:password@host:port/database)
# For Docker Compose, use: postgresql://user:password@db:5432/database
DATABASE_URL=postgresql://supercode_user:your_secure_password_here_change_this@db:5432/supercode_db

# ============================================================================
# NEXTAUTH CONFIGURATION
# ============================================================================
# Generate with: openssl rand -base64 32
AUTH_SECRET=your_random_secret_generated_with_openssl

# NextAuth URLs
AUTH_URL=https://your-domain.com
AUTH_TRUST_HOST=true

# ============================================================================
# OAUTH PROVIDERS (GitHub)
# ============================================================================
# Create OAuth app at: https://github.com/settings/developers
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret

# ============================================================================
# OAUTH PROVIDERS (Google)
# ============================================================================
# Create OAuth credentials at: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_secret

# ============================================================================
# OAUTH PROVIDERS (Additional - Optional)
# ============================================================================
# Add other OAuth providers as needed (Discord, Twitter, etc.)

# ============================================================================
# APPLICATION FEATURES
# ============================================================================
# Enable/disable features as needed
NEXT_TELEMETRY_DISABLED=1
```

**Important:** Replace all placeholder values with your actual credentials!

Press `Ctrl+X`, then `Y`, then `Enter` to save the file.

### Step 3: Build and Start Services

```bash
# Build the Docker image
docker compose build

# Start services in background
docker compose up -d

# View service status
docker compose ps

# Check logs
docker compose logs -f
```

The application should now be accessible at:
- `http://YOUR_EC2_PUBLIC_IP:3000`
- `https://your-domain.com` (if domain is configured with SSL)

---

## Database Setup & Migrations

### Step 1: Run Prisma Migrations

```bash
# Execute database migrations
docker compose exec web pnpm prisma migrate deploy

# (Optional) Generate Prisma client
docker compose exec web pnpm prisma generate

# (Optional) Seed database with initial data
docker compose exec web pnpm prisma db seed
```

### Step 2: Verify Database Connection

```bash
# Connect to PostgreSQL database
docker compose exec db psql -U supercode_user -d supercode_db

# List tables (psql command)
\dt

# Exit psql
\q
```

### Step 3: Backup Database

```bash
# Create a backup
docker compose exec db pg_dump -U supercode_user supercode_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T db psql -U supercode_user supercode_db < backup_file.sql
```

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db:5432/db` |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) | Random base64 string |
| `AUTH_URL` | Your application URL | `https://your-domain.com` |
| `GITHUB_ID` | GitHub OAuth application ID | From GitHub settings |
| `GITHUB_SECRET` | GitHub OAuth secret | From GitHub settings |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_SECRET` | Google OAuth secret | From Google Cloud Console |

### Generate Secure Values

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate DB_PASSWORD
openssl rand -base64 32
```

---

## Production Considerations

### 1. Use a Reverse Proxy (Nginx)

For production, use Nginx as a reverse proxy:

```bash
# Install Nginx
sudo apt-get install -y nginx

# Enable Nginx to start on reboot
sudo systemctl enable nginx
sudo systemctl start nginx
```

Create Nginx configuration (`/etc/nginx/sites-available/super-code`):

```nginx
upstream next_app {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy settings
    location / {
        proxy_pass http://next_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/super-code /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renew certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 3. Enable Auto-Start on System Reboot

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/docker-super-code.service
```

Paste:

```ini
[Unit]
Description=Super Code Docker Compose
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/home/ubuntu/super-code
ExecStart=/usr/local/bin/docker compose up -d
ExecStop=/usr/local/bin/docker compose down
User=ubuntu
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable docker-super-code.service
sudo systemctl start docker-super-code.service
```

### 4. Setup Monitoring (Optional)

Monitor Docker containers with Portainer:

```bash
docker run -d \
  -p 8000:8000 \
  -p 9000:9000 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Access Portainer at `http://YOUR_EC2_PUBLIC_IP:9000`

---

## Monitoring & Logs

### View Logs

```bash
# View all service logs
docker compose logs

# Follow logs (real-time)
docker compose logs -f

# View specific service logs
docker compose logs -f web
docker compose logs -f db

# Show last 100 lines
docker compose logs --tail=100

# View logs with timestamps
docker compose logs -f --timestamps
```

### Monitor Resource Usage

```bash
# Real-time container stats
docker stats

# Check specific container
docker compose stats web
```

### Check Service Health

```bash
# View service status
docker compose ps

# Inspect specific service
docker compose exec web curl http://localhost:3000

# Database connection test
docker compose exec db pg_isready -U supercode_user
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs web

# Rebuild without cache
docker compose build --no-cache

# Restart all services
docker compose down
docker compose up -d
```

### Database Connection Error

```bash
# Check database logs
docker compose logs db

# Test connection manually
docker compose exec db psql -U supercode_user -d supercode_db

# Verify DATABASE_URL in .env is correct
# Format: postgresql://user:password@db:5432/database
```

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Or change port in docker-compose.yml
# Change "3000:3000" to "3001:3000"
```

### Permission Denied

```bash
# Re-add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker compose up -d
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up Docker images/containers
docker system prune -a
docker volume prune
```

### Application Memory Issues

Uncomment and adjust resource limits in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

---

## Useful Commands

### Common Docker Compose Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View running services
docker compose ps

# View logs
docker compose logs -f

# Execute command in container
docker compose exec web <command>

# Rebuild images
docker compose build

# Remove unused resources
docker compose down -v  # Also removes volumes

# Restart specific service
docker compose restart web
```

### Database Management

```bash
# Connect to database
docker compose exec db psql -U supercode_user -d supercode_db

# Backup database
docker compose exec db pg_dump -U supercode_user supercode_db > backup.sql

# Restore database
docker compose exec -T db psql -U supercode_user supercode_db < backup.sql

# Run migrations
docker compose exec web pnpm prisma migrate deploy

# Open Prisma Studio
docker compose exec web pnpm prisma studio
```

### Application Management

```bash
# View application logs
docker compose logs -f web

# Restart application
docker compose restart web

# Execute application commands
docker compose exec web pnpm build

# SSH into container
docker compose exec web sh
```

### System Management

```bash
# View system-wide Docker info
docker system info

# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune

# View Docker version
docker --version
docker compose version
```

---

## Next Steps

1. **Setup Monitoring:** Configure CloudWatch, DataDog, or other monitoring tools
2. **Setup Backups:** Automate database backups (e.g., daily S3 upload)
3. **Setup CI/CD:** Use GitHub Actions to auto-deploy on push
4. **Performance Tuning:** Monitor and optimize based on traffic patterns
5. **Security:** Regular security updates, fail2ban for SSH, WAF rules

---

## Support

For issues or questions:
- Check Docker documentation: https://docs.docker.com/
- Check Next.js documentation: https://nextjs.org/docs
- Check Prisma documentation: https://www.prisma.io/docs/
- Review application logs: `docker compose logs -f`

