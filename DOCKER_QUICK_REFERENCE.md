# Quick Reference - Docker Deployment Commands

## Quick Start (Local Development)

```bash
# Setup environment
cp .env.example .env
nano .env  # Edit with your values

# Start services
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f web

# Stop services
docker compose down
```

## Building & Deployment

```bash
# Build Docker image
docker compose build

# Build without cache
docker compose build --no-cache

# Start all services
docker compose up -d

# Start specific service
docker compose up -d web

# Restart services
docker compose restart
docker compose restart web  # Specific service

# Stop services
docker compose stop
docker compose down  # Stop and remove containers

# View running services
docker compose ps
```

## Database Operations

```bash
# Run migrations
docker compose exec web pnpm prisma migrate deploy

# Generate Prisma client
docker compose exec web pnpm prisma generate

# Seed database
docker compose exec web pnpm prisma db seed

# Open Prisma Studio (visual database viewer)
docker compose exec web pnpm prisma studio

# Connect to database directly
docker compose exec db psql -U supercode_user -d supercode_db

# Backup database
docker compose exec db pg_dump -U supercode_user supercode_db > backup_$(date +%Y%m%d).sql

# Restore database from backup
docker compose exec -T db psql -U supercode_user supercode_db < backup_file.sql
```

## Logs & Monitoring

```bash
# View all logs
docker compose logs

# View real-time logs
docker compose logs -f

# View specific service logs
docker compose logs -f web
docker compose logs -f db

# Show last N lines
docker compose logs --tail=100

# Logs with timestamps
docker compose logs -f --timestamps

# Monitor resource usage
docker stats
docker compose stats web

# View container details
docker inspect <container_id>

# Check service health
docker compose ps  # Shows health status
```

## Environment & Configuration

```bash
# Edit environment file
nano .env

# View current environment
docker compose exec web printenv | grep -E "DATABASE_URL|AUTH|NODE_ENV"

# Reload environment (restart required)
docker compose down
docker compose up -d
```

## Troubleshooting

```bash
# Check service status
docker compose ps

# View detailed logs
docker compose logs web

# Connect to container shell
docker compose exec web sh
docker compose exec db bash

# Rebuild and restart (fix most issues)
docker compose down
docker compose build --no-cache
docker compose up -d

# Clean up (removes stopped containers and unused images)
docker system prune -a

# Check disk usage
docker system df

# Force remove container
docker compose down -v  # Also removes volumes
```

## SSH to EC2 & Manual Deployment

```bash
# Connect to EC2
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_IP

# Navigate to project
cd /path/to/super-code

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose build
docker compose down
docker compose up -d

# Check status
docker compose ps
docker compose logs -f web
```

## Production Deployment Checklist

```bash
# 1. Create .env file
cp .env.example .env
nano .env  # Add all required secrets

# 2. Build image
docker compose build

# 3. Start services
docker compose up -d

# 4. Run migrations
docker compose exec web pnpm prisma migrate deploy

# 5. Verify health
docker compose ps
curl http://localhost:3000/

# 6. Check logs
docker compose logs web

# 7. Setup Nginx (optional)
sudo apt-get install -y nginx
# Configure as reverse proxy

# 8. Setup SSL (optional)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com

# 9. Enable auto-start (optional)
sudo systemctl enable docker-super-code.service
```

## Useful Environment Commands

```bash
# Generate secrets
openssl rand -base64 32

# Test database connection
docker compose exec db pg_isready -U supercode_user

# Test application health
curl http://localhost:3000/

# View application details
docker compose exec web npm list next
docker compose exec web node --version
docker --version
```

## Nginx Configuration (Reverse Proxy)

```nginx
upstream next_app {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | `lsof -i :3000` and kill process, or change port in docker-compose.yml |
| Database connection failed | Check DATABASE_URL, ensure db container is running: `docker compose logs db` |
| AUTH_SECRET not set | Generate: `openssl rand -base64 32` and add to .env |
| Migrations failed | Ensure DB is running: `docker compose up -d db` and wait for health check |
| Container won't start | Check logs: `docker compose logs web`, rebuild: `docker compose build --no-cache` |
| Out of disk space | Clean up: `docker system prune -a` |
| Permission denied | Add user to docker: `sudo usermod -aG docker $USER` then `newgrp docker` |

## Useful Docker Compose Files

### Minimal Setup (Local Development)
```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
```

### Full Setup (Recommended)
See `docker-compose.yml` in the repository

### With Additional Services
Add Redis, Nginx, monitoring tools as needed

## Reference Documentation

- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs/
- NextAuth: https://next-auth.js.org/
- PostgreSQL: https://www.postgresql.org/docs/

