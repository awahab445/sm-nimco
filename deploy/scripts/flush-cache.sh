#!/usr/bin/env bash
# Flush storefront/admin Next.js caches on deploy.
#
# Modes:
#   --disk          Remove .next/cache (and image/fetch caches) on the host before rebuild
#   --runtime       POST /api/revalidate on the running storefront (needs REVALIDATE_SECRET)
#   --all           Both (default)
#
# Usage:
#   bash deploy/scripts/flush-cache.sh
#   bash deploy/scripts/flush-cache.sh --disk
#   bash deploy/scripts/flush-cache.sh --runtime
#   REVALIDATE_URL=http://127.0.0.1:3001 bash deploy/scripts/flush-cache.sh --runtime
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

MODE="all"
for arg in "$@"; do
  case "${arg}" in
    --disk) MODE="disk" ;;
    --runtime) MODE="runtime" ;;
    --all) MODE="all" ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: ${arg}"
      exit 1
      ;;
  esac
done

flush_disk() {
  echo "=== Flushing Next.js disk caches ==="
  local cleared=0
  for app in frontend admin; do
    local cache_dir="${REPO_ROOT}/${app}/.next/cache"
    if [[ -d "${cache_dir}" ]]; then
      rm -rf "${cache_dir}"
      echo "Removed ${app}/.next/cache"
      cleared=1
    fi
  done
  if [[ "${cleared}" -eq 0 ]]; then
    echo "No .next/cache directories present (clean)."
  fi
}

load_revalidate_secret() {
  if [[ -n "${REVALIDATE_SECRET:-}" ]]; then
    return 0
  fi

  # Prefer storefront env, then docker.env / demo.env
  local candidates=(
    "${REPO_ROOT}/frontend/.env"
    "${REPO_ROOT}/frontend/.env.local"
    "${REPO_ROOT}/deploy/env/docker.env"
    "${REPO_ROOT}/deploy/env/demo.env"
  )
  for file in "${candidates[@]}"; do
    if [[ -f "${file}" ]]; then
      # shellcheck disable=SC1090
      set +u
      # Extract without sourcing whole file (may contain unrelated syntax)
      local value
      value="$(grep -E '^REVALIDATE_SECRET=' "${file}" | tail -n1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
      set -u
      if [[ -n "${value}" ]]; then
        REVALIDATE_SECRET="${value}"
        return 0
      fi
    fi
  done
  return 1
}

resolve_revalidate_url() {
  if [[ -n "${REVALIDATE_URL:-}" ]]; then
    echo "${REVALIDATE_URL%/}/api/revalidate"
    return 0
  fi

  if [[ -f "${REPO_ROOT}/deploy/env/docker.env" ]]; then
    # shellcheck disable=SC1091
    source "${REPO_ROOT}/deploy/env/docker.env"
    if [[ -n "${HOST_STOREFRONT_PORT:-}" ]]; then
      echo "http://127.0.0.1:${HOST_STOREFRONT_PORT}/api/revalidate"
      return 0
    fi
    if [[ -n "${SHOP_URL:-}" ]]; then
      echo "${SHOP_URL%/}/api/revalidate"
      return 0
    fi
  fi

  # PM2 default storefront port
  echo "http://127.0.0.1:3001/api/revalidate"
}

flush_runtime() {
  echo "=== Flushing storefront runtime cache (on-demand revalidate) ==="

  if ! load_revalidate_secret; then
    echo "WARN: REVALIDATE_SECRET not set — skipping runtime revalidate."
    echo "      Set REVALIDATE_SECRET in frontend/.env (or docker.env) so deploys can flush ISR."
    return 0
  fi

  local url
  url="$(resolve_revalidate_url)"
  echo "POST ${url}"

  local attempt
  for attempt in $(seq 1 30); do
    if curl -sf -X POST \
      -H "Authorization: Bearer ${REVALIDATE_SECRET}" \
      -H "Content-Type: application/json" \
      "${url}" >/tmp/ecommerce-revalidate.json 2>/dev/null; then
      echo "Runtime cache flushed:"
      cat /tmp/ecommerce-revalidate.json
      echo ""
      return 0
    fi
    sleep 2
  done

  echo "WARN: Could not reach ${url} after retries — disk flush / new build still applied."
  return 0
}

case "${MODE}" in
  disk)
    flush_disk
    ;;
  runtime)
    flush_runtime
    ;;
  all)
    flush_disk
    flush_runtime
    ;;
esac

echo "Cache flush complete (${MODE})."
