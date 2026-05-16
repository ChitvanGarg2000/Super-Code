# EC2 Docker Deployment (Next.js + Prisma + NextAuth)

This repo is a Next.js app that needs these env vars:

```bash
DATABASE_URL=
AUTH_SECRET=
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
# Recommended in production:
AUTH_URL=https://your-domain.com
AUTH_TRUST_HOST=true
```

## 1) Create an EC2 instance

- Ubuntu 22.04 (or 24.04)
- Security Group inbound:
  - TCP 22 from **your IP** (SSH)
  - TCP 80 and 443 from **0.0.0.0/0** (recommended if you’ll use a domain + HTTPS)
  - (Optional for quick test) TCP 3000 from your IP

## 2) Install Docker

On the EC2 instance:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git

# Docker Engine (official convenience script)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version
```

## 3) Get your code onto EC2

```bash
git clone <YOUR_REPO_URL>
cd <YOUR_REPO_FOLDER>
```

## 4) Create the production `.env`

```bash
nano .env
```

Example:

```bash
DATABASE_URL=mongodb+srv://...
AUTH_SECRET=<random-32-bytes-hex>
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_SECRET=...

# If you have a domain:
AUTH_URL=https://your-domain.com
AUTH_TRUST_HOST=true
```

Generate `AUTH_SECRET` locally:

```bash
openssl rand -hex 32
```

## 5) Build and run

```bash
docker compose up -d --build
docker compose logs -f --tail=200
```

App should be reachable at:
- `http://<EC2_PUBLIC_IP>:3000` (if you opened 3000)
- or through your reverse proxy / load balancer

## 6) OAuth callback URLs (important)

Update your OAuth providers to match your production URL:

- **GitHub OAuth app** callback: `https://your-domain.com/api/auth/callback/github`
- **Google OAuth** redirect: `https://your-domain.com/api/auth/callback/google`

If testing by IP + port, use `http://<EC2_PUBLIC_IP>:3000/...` (some providers discourage non-HTTPS).

## Notes / Common issues

- **Prisma on Linux**: this repo must generate Prisma with Linux-compatible binaries. The schema uses `binaryTargets = ["native"]` for that.
- **MongoDB Atlas network access**: allow your EC2 outbound IP (or temporarily `0.0.0.0/0`) and ensure TLS is enabled.
- **HTTPS**: recommended for OAuth. Put Nginx/Caddy in front of the container or use an ALB + ACM cert.
