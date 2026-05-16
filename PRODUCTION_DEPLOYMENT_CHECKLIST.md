# EC2 Production Deployment Checklist

Use this checklist to ensure your production deployment is secure and properly configured.

## ✅ Pre-Deployment Preparation

- [ ] Repository is clean (all changes committed)
- [ ] No sensitive data in code or .env.example
- [ ] README.md updated with deployment instructions
- [ ] Dockerfile reviewed and tested locally
- [ ] docker-compose.yml reviewed for production settings
- [ ] All environment variables documented
- [ ] Database migrations tested locally
- [ ] Application tested locally: `http://localhost:3000`

## ✅ AWS EC2 Setup

- [ ] EC2 instance created (Ubuntu 22.04 or 24.04 LTS)
- [ ] Instance type appropriate for expected traffic (t3.small minimum)
- [ ] Storage: 30GB+ allocated
- [ ] Elastic IP assigned (for consistent IP)
- [ ] Security group configured:
  - [ ] SSH (port 22) from your IP only
  - [ ] HTTP (port 80) from 0.0.0.0/0
  - [ ] HTTPS (port 443) from 0.0.0.0/0
  - [ ] Custom TCP 3000 from your IP (optional, for testing)
- [ ] SSH key pair downloaded and secured
- [ ] Can successfully SSH into instance

## ✅ Docker Installation on EC2

- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker compose version`
- [ ] Current user added to docker group: `groups $USER`
- [ ] No need for `sudo` when running docker
- [ ] Docker daemon starts on boot: `sudo systemctl enable docker`

## ✅ Application Deployment

- [ ] Repository cloned to EC2
- [ ] `.env` file created with production values:
  - [ ] `DATABASE_URL` set to PostgreSQL connection string
  - [ ] `AUTH_SECRET` generated with `openssl rand -base64 32`
  - [ ] `AUTH_URL` set to production domain (https://your-domain.com)
  - [ ] `GITHUB_ID` and `GITHUB_SECRET` from OAuth app
  - [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET` from Google Cloud
  - [ ] `DB_PASSWORD` changed from default
  - [ ] `NODE_ENV=production`
- [ ] `.env` file permissions secure (readable by docker only)
- [ ] `.env` NOT committed to git

## ✅ Docker Services Setup

- [ ] Docker image built: `docker compose build`
- [ ] Services start without errors: `docker compose up -d`
- [ ] Services running: `docker compose ps` shows 2 services (web, db)
- [ ] Database healthy: `docker compose ps` shows db "healthy"
- [ ] Application running: `docker compose logs web` shows no errors
- [ ] Application accessible on private IP: `curl http://localhost:3000`

## ✅ Database Setup

- [ ] Database container healthy
- [ ] Migrations executed: `docker compose exec web pnpm prisma migrate deploy`
- [ ] Prisma client generated: `docker compose exec web pnpm prisma generate`
- [ ] Database connection verified: `docker compose exec db pg_isready`
- [ ] Initial data seeded (if applicable)
- [ ] Database backup created: `docker compose exec db pg_dump ... > backup.sql`

## ✅ Domain & DNS Configuration

- [ ] Domain name registered or transferred
- [ ] DNS A record points to EC2 Elastic IP
- [ ] DNS propagation verified: `nslookup your-domain.com`
- [ ] DNS TTL set appropriately (300-3600 seconds)

## ✅ SSL/HTTPS Configuration

- [ ] Nginx installed on EC2
- [ ] Nginx reverse proxy configured
- [ ] Let's Encrypt SSL certificate generated: `sudo certbot certonly --nginx -d your-domain.com`
- [ ] Nginx SSL configuration in place
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate auto-renewal enabled: `sudo systemctl enable certbot.timer`
- [ ] SSL certificate verified: `curl -I https://your-domain.com` (no warnings)

## ✅ Security Hardening

- [ ] SSH public key authentication only (no password auth)
- [ ] SSH default port changed (optional but recommended)
- [ ] Firewall configured with UFW:
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw enable
  ```
- [ ] fail2ban installed (optional): `sudo apt-get install fail2ban`
- [ ] Docker runs as non-root (verified in Dockerfile)
- [ ] Database password is strong and unique
- [ ] All secrets stored in environment variables (not in code)
- [ ] .env file is in .gitignore
- [ ] Security group restricts unnecessary access

## ✅ Auto-Start & Systemd Service

- [ ] Systemd service file created: `/etc/systemd/system/docker-super-code.service`
- [ ] Service enabled: `sudo systemctl enable docker-super-code.service`
- [ ] Service started: `sudo systemctl start docker-super-code.service`
- [ ] Service running: `sudo systemctl status docker-super-code.service`
- [ ] Services restart on boot verification (optional: reboot and check)

## ✅ Logging & Monitoring

- [ ] Application logs accessible: `docker compose logs -f web`
- [ ] Database logs accessible: `docker compose logs -f db`
- [ ] Logs are rotated (JSON driver with rotation configured)
- [ ] CloudWatch agent installed (optional, for AWS monitoring)
- [ ] Health checks passing: `docker compose ps` shows healthy status
- [ ] Monitoring setup in place (optional):
  - [ ] New Relic, DataDog, or similar agent installed
  - [ ] Email/Slack alerts configured
  - [ ] Critical metrics identified

## ✅ Backup & Recovery

- [ ] Database backup strategy defined
- [ ] Automated daily database backups configured (cron job)
- [ ] Backup storage secure (AWS S3 or similar)
- [ ] Backup restore procedure tested
- [ ] Application backup procedure defined
- [ ] Recovery time objective (RTO) documented
- [ ] Recovery point objective (RPO) documented

## ✅ Performance & Optimization

- [ ] Docker resource limits configured (in docker-compose.yml if needed)
- [ ] Application startup time acceptable
- [ ] Database queries optimized
- [ ] Static assets cached properly
- [ ] CDN considered for static files (optional)
- [ ] Load testing performed (if expected high traffic)

## ✅ Testing

- [ ] Application accessible via domain: `https://your-domain.com`
- [ ] OAuth login working (GitHub and Google)
- [ ] Database operations working correctly
- [ ] User registration and authentication working
- [ ] Email functionality working (if applicable)
- [ ] SSL certificate valid and trusted
- [ ] Application responsive and performant
- [ ] Mobile responsiveness verified
- [ ] All features tested in production environment

## ✅ Documentation

- [ ] Deployment procedure documented
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API documentation complete (if applicable)
- [ ] Troubleshooting guide created
- [ ] Backup procedures documented
- [ ] Recovery procedures documented
- [ ] Team onboarding guide updated

## ✅ Post-Deployment

- [ ] Monitor logs for errors in first 24 hours
- [ ] Verify analytics/monitoring tools are working
- [ ] Set up alert notifications
- [ ] Document any custom configurations
- [ ] Schedule regular maintenance windows
- [ ] Plan for horizontal scaling if needed
- [ ] Setup performance baseline metrics
- [ ] Create incident response plan

## ✅ Optional but Recommended

- [ ] Setup Portainer for container management: `http://YOUR_IP:9000`
- [ ] Setup pg_admin for database management
- [ ] Configure WAF (AWS WAF) rules
- [ ] Setup CloudFlare CDN for domain
- [ ] Implement rate limiting
- [ ] Setup request logging and analysis
- [ ] Configure S3 bucket for backups
- [ ] Setup RDS for managed database (future)

## ✅ Emergency Contacts & Procedures

- [ ] Emergency contact list established
- [ ] Escalation procedures defined
- [ ] Status page setup (Statuspage.io, etc.)
- [ ] Incident communication plan ready

## Quick Health Check Commands

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Check services running
docker compose ps

# View application logs (recent errors)
docker compose logs web --tail=50

# Test database connection
docker compose exec db pg_isready

# Check disk space
df -h

# Check CPU/Memory usage
docker stats

# Verify SSL certificate
curl -I https://your-domain.com
```

## Maintenance Schedule

- **Daily:** Check logs for errors, verify services are running
- **Weekly:** Review resource usage, backup verification
- **Monthly:** Security updates, performance review
- **Quarterly:** Full disaster recovery test, capacity planning
- **Yearly:** SSL certificate renewal verification, full audit

## Support Contacts

- AWS Support: https://console.aws.amazon.com/support/
- Docker Support: https://www.docker.com/support/
- Let's Encrypt: https://letsencrypt.org/
- Your application support team: [Add contacts]

---

**Last Updated:** 2026-05-16  
**Deployment Status:** ✅ Production Ready  
**Checklist Version:** 1.0

