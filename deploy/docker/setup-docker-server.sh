#!/usr/bin/env bash
# Bootstrap Ubuntu 22.04/24.04 VPS for Docker deployment (Hostinger KVM 2, etc.).
# Installs Docker, Nginx, Certbot, UFW, swap. Does NOT install Node/PM2/Postgres on host.
# Usage: sudo bash deploy/docker/setup-docker-server.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/docker/setup-docker-server.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
SWAP_SIZE_GB="${SWAP_SIZE_GB:-4}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"

echo "=== System update ==="
apt-get update
apt-get upgrade -y
apt-get install -y curl ca-certificates gnupg lsb-release ufw git

echo "=== Docker Engine ==="
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  echo "Docker already installed: $(docker --version)"
fi

echo "=== Nginx + Certbot ==="
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable nginx

echo "=== Firewall (UFW) ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== Swap (${SWAP_SIZE_GB}G) ==="
if [[ ! -f /swapfile ]]; then
  fallocate -l "${SWAP_SIZE_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  echo "Swap enabled."
else
  echo "Swap file already exists."
fi

if id "${DEPLOY_USER}" >/dev/null 2>&1; then
  echo "=== Docker group for ${DEPLOY_USER} ==="
  usermod -aG docker "${DEPLOY_USER}"
else
  echo "=== Creating deploy user: ${DEPLOY_USER} ==="
  useradd -m -s /bin/bash "${DEPLOY_USER}"
  usermod -aG sudo,docker "${DEPLOY_USER}"
  if [[ -f /root/.ssh/authorized_keys ]]; then
    mkdir -p "/home/${DEPLOY_USER}/.ssh"
    cp /root/.ssh/authorized_keys "/home/${DEPLOY_USER}/.ssh/"
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
    chmod 700 "/home/${DEPLOY_USER}/.ssh"
    chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"
  fi
  echo "User ${DEPLOY_USER} created. Log in as ${DEPLOY_USER} for app deploy."
fi

mkdir -p /var/www
if id "${DEPLOY_USER}" >/dev/null 2>&1; then
  chown "${DEPLOY_USER}:${DEPLOY_USER}" /var/www
fi

echo ""
echo "=== Setup complete ==="
echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"
echo "Nginx: $(nginx -v 2>&1)"
echo ""
echo "Next steps (as ${DEPLOY_USER} or your deploy user):"
echo "  1. Log out and back in (docker group)"
echo "  2. cd /var/www && git clone <repo> ecommerce-platform"
echo "  3. cd ecommerce-platform && bash deploy/docker/init-env.sh"
echo "  4. bash deploy/docker/deploy.sh"
