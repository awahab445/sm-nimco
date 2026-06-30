#!/usr/bin/env bash
# Rewrite localhost dev URLs in Docker Postgres to production URLs from docker.env.
# Run on VPS after restore-db.sh. Safe to run multiple times.
#
# Usage: bash deploy/docker/sanitize-prod-urls.sh
#   Optional overrides:
#     LOCAL_API_URL=http://localhost:3000
#     LOCAL_SHOP_URL=http://localhost:3001
#     LOCAL_ADMIN_URL=http://localhost:3002
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/env/docker.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

# shellcheck source=/dev/null
source "${ENV_FILE}"

LOCAL_API_URL="${LOCAL_API_URL:-http://localhost:3000}"
LOCAL_SHOP_URL="${LOCAL_SHOP_URL:-http://localhost:3001}"
LOCAL_ADMIN_URL="${LOCAL_ADMIN_URL:-http://localhost:3002}"

for var in API_URL SHOP_URL ADMIN_URL POSTGRES_USER POSTGRES_DB; do
  if [[ -z "${!var:-}" ]]; then
    echo "docker.env: ${var} is required"
    exit 1
  fi
done

strip_trailing_slash() {
  local v="$1"
  echo "${v%/}"
}

PROD_API="$(strip_trailing_slash "${API_URL}")"
PROD_SHOP="$(strip_trailing_slash "${SHOP_URL}")"
PROD_ADMIN="$(strip_trailing_slash "${ADMIN_URL}")"
LOCAL_API="$(strip_trailing_slash "${LOCAL_API_URL}")"
LOCAL_SHOP="$(strip_trailing_slash "${LOCAL_SHOP_URL}")"
LOCAL_ADMIN="$(strip_trailing_slash "${LOCAL_ADMIN_URL}")"

# Also handle 127.0.0.1 variants
LOCAL_API_ALT="${LOCAL_API/localhost/127.0.0.1}"

psql_exec() {
  docker exec -i ecommerce-postgres psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" "$@"
}

echo "=== Sanitizing URLs in ${POSTGRES_DB} ==="
echo "  API:   ${LOCAL_API} → ${PROD_API}"
echo "  Shop:  ${LOCAL_SHOP} → ${PROD_SHOP}"
echo "  Admin: ${LOCAL_ADMIN} → ${PROD_ADMIN}"

psql_exec <<SQL
BEGIN;

-- Product / CMS / nav image URLs (full absolute URLs)
UPDATE product_images SET url = REPLACE(url, '${LOCAL_API}', '${PROD_API}')
  WHERE url LIKE '%${LOCAL_API}%';
UPDATE product_images SET url = REPLACE(url, '${LOCAL_API_ALT}', '${PROD_API}')
  WHERE url LIKE '%${LOCAL_API_ALT}%';

UPDATE cms_banner_slides SET image_url = REPLACE(image_url, '${LOCAL_API}', '${PROD_API}')
  WHERE image_url LIKE '%${LOCAL_API}%';
UPDATE cms_banner_slides SET image_url = REPLACE(image_url, '${LOCAL_API_ALT}', '${PROD_API}')
  WHERE image_url LIKE '%${LOCAL_API_ALT}%';

UPDATE storefront_nav_links SET banner_image_url = REPLACE(banner_image_url, '${LOCAL_API}', '${PROD_API}')
  WHERE banner_image_url IS NOT NULL AND banner_image_url LIKE '%${LOCAL_API}%';
UPDATE storefront_nav_links SET banner_image_url = REPLACE(banner_image_url, '${LOCAL_API_ALT}', '${PROD_API}')
  WHERE banner_image_url IS NOT NULL AND banner_image_url LIKE '%${LOCAL_API_ALT}%';

-- CMS / nav links that pointed at local storefront or admin
UPDATE cms_banner_slides SET cta_href = REPLACE(cta_href, '${LOCAL_SHOP}', '${PROD_SHOP}')
  WHERE cta_href IS NOT NULL AND cta_href LIKE '%${LOCAL_SHOP}%';
UPDATE cms_banner_slides SET cta_href = REPLACE(cta_href, '${LOCAL_ADMIN}', '${PROD_ADMIN}')
  WHERE cta_href IS NOT NULL AND cta_href LIKE '%${LOCAL_ADMIN}%';

UPDATE storefront_nav_links SET href = REPLACE(href, '${LOCAL_SHOP}', '${PROD_SHOP}')
  WHERE href LIKE '%${LOCAL_SHOP}%';
UPDATE storefront_nav_links SET banner_href = REPLACE(banner_href, '${LOCAL_SHOP}', '${PROD_SHOP}')
  WHERE banner_href IS NOT NULL AND banner_href LIKE '%${LOCAL_SHOP}%';

-- Order line metadata (productImage etc. stored as JSON text)
UPDATE order_items SET metadata = REPLACE(metadata::text, '${LOCAL_API}', '${PROD_API}')::jsonb
  WHERE metadata::text LIKE '%${LOCAL_API}%';
UPDATE order_items SET metadata = REPLACE(metadata::text, '${LOCAL_API_ALT}', '${PROD_API}')::jsonb
  WHERE metadata::text LIKE '%${LOCAL_API_ALT}%';

UPDATE orders SET metadata = REPLACE(metadata::text, '${LOCAL_API}', '${PROD_API}')::jsonb
  WHERE metadata::text LIKE '%${LOCAL_API}%';

COMMIT;
SQL

echo ""
echo "=== Sanitize complete ==="
echo "Re-check in admin:"
echo "  - Payment gateway keys (Stripe) — use live/test keys appropriate for production"
echo "  - Any hardcoded links in CMS pages"
echo "Users must log in again (JWT secret differs between local and VPS)."
