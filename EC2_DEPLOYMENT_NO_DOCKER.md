# Deploying to EC2 without Docker

This guide shows a minimal, repeatable way to deploy the `super-code` Next.js app to an Ubuntu EC2 instance without Docker.

Prerequisites
- An EC2 instance (Ubuntu 22.04 or 24.04 recommended).
- Security group allowing SSH (22), HTTP (80) and HTTPS (443).

1) Connect and prepare the instance

```bash
# SSH into instance
ssh ubuntu@<EC2_PUBLIC_IP>

sudo apt update && sudo apt upgrade -y
# install essentials
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential git nginx

# enable Corepack + pnpm
corepack enable
corepack prepare pnpm@latest --activate
```

2) Clone, install and build

```bash
cd /home/ubuntu
git clone <REPO_URL> super-code
cd super-code
pnpm install --frozen-lockfile
pnpm build
```

3) Run the app (systemd recommended)

Create a systemd service at `/etc/systemd/system/super-code.service` (adjust `User`/`WorkingDirectory`):

```ini
[Unit]
Description=super-code Next.js
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/super-code
ExecStart=/usr/bin/env pnpm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable super-code
sudo systemctl start super-code
sudo journalctl -u super-code -f
```

Alternatively, use `pm2` for process management:

```bash
sudo npm i -g pm2
pm2 start "pnpm start" --name super-code
pm2 save
pm2 startup systemd
```

4) Configure Nginx as a reverse proxy

Example `/etc/nginx/sites-available/super-code`:

```nginx
server {
    listen 80;
    server_name example.com; # replace

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload nginx:

```bash
sudo ln -s /etc/nginx/sites-available/super-code /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

5) TLS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

6) Environment variables & secrets
- Store production secrets in a `.env.production` file outside version control and reference them in your service unit (`EnvironmentFile=/home/ubuntu/super-code/.env.production`) or export them in the systemd unit.

7) Automate with cloud-init (user-data)

Example minimal user-data to provision and start the app on first boot:

```bash
#cloud-config
package_update: true
packages:
  - git
  - nginx
write_files:
  - path: /home/ubuntu/bootstrap.sh
    permissions: '0755'
    content: |
      #!/bin/bash
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs build-essential git
      corepack enable
      corepack prepare pnpm@latest --activate
      cd /home/ubuntu
      git clone <REPO_URL> super-code
      cd super-code
      pnpm install --frozen-lockfile
      pnpm build
      # create systemd unit and start (see guide above)

runcmd:
  - [ bash, /home/ubuntu/bootstrap.sh ]
```

Troubleshooting & tips
- If your app uses server-side features (Edge functions, special adapters), verify the runtime and Node version compatibility.
- Use `sudo journalctl -u super-code -n 200` to inspect logs.
- Keep your instance updated and snapshot AMIs for quick recovery.

If you want, I can also add an automated `user-data` script tailored to this repo.
