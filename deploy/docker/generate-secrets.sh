#!/usr/bin/env bash
# Generate production secrets for deploy/env/docker.env
# Usage: bash deploy/docker/generate-secrets.sh
set -euo pipefail

echo "# Paste these into deploy/env/docker.env"
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "BOOTSTRAP_TOKEN=$(openssl rand -hex 24)"
echo "REVALIDATE_SECRET=$(openssl rand -hex 32)"
