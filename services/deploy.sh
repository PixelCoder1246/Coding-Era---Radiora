#!/bin/bash
# =============================================================================
# Radiora Services – EC2 Deploy
# =============================================================================
# Usage (HTTP only — no email needed):
#   ./deploy.sh
#
# Usage (HTTPS with SSL certs):
#   ./deploy.sh yourname@gmail.com
#
# Requirements on EC2:
#   - Docker installed
#   - System nginx already running
#   - Ports 80, 4242 open in EC2 Security Group (add 443 if you want HTTPS)
# =============================================================================

set -e

EMAIL="${1:-}"  # Optional — if provided, HTTPS is set up via certbot

# ── Auto-detect EC2 public IP ─────────────────────────────────────────────────
echo "Detecting EC2 public IP..."

EC2_IP=$(curl -sf --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 || true)

if [ -z "$EC2_IP" ]; then
  TOKEN=$(curl -sf --max-time 5 \
    -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
  if [ -n "$TOKEN" ]; then
    EC2_IP=$(curl -sf --max-time 5 \
      -H "X-aws-ec2-metadata-token: $TOKEN" \
      http://169.254.169.254/latest/meta-data/public-ipv4 || true)
  fi
fi

if [ -z "$EC2_IP" ]; then
  read -rp "Could not auto-detect EC2 IP. Enter it manually: " EC2_IP
fi

IP_DASHED="${EC2_IP//./-}"
ORTHANC_DOMAIN="orthanc-${IP_DASHED}.nip.io"
HIS_DOMAIN="his-${IP_DASHED}.nip.io"

if [ -n "$EMAIL" ]; then
  PROTOCOL="https"
else
  PROTOCOL="http"
fi

echo ""
echo "============================================================"
echo " Radiora Services – Deploying"
echo "============================================================"
echo "   EC2 IP      : ${EC2_IP}"
echo "   Orthanc     : ${PROTOCOL}://${ORTHANC_DOMAIN}"
echo "   HIS         : ${PROTOCOL}://${HIS_DOMAIN}"
echo "   DICOM port  : ${EC2_IP}:4242"
echo "   HTTPS       : $([ -n "$EMAIL" ] && echo "YES (certbot)" || echo "NO (HTTP only)")"
echo "============================================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Step 1: Start Docker containers ──────────────────────────────────────────
echo "[1/3] Starting Radiora Docker containers..."
docker compose up -d --build
echo "      ✓ HIS running on 127.0.0.1:3010"
echo "      ✓ Orthanc running on 127.0.0.1:8042"
echo "      ✓ DICOM running on 0.0.0.0:4242"

# ── Step 2: Write nginx config ────────────────────────────────────────────────
echo ""
echo "[2/3] Writing nginx config to /etc/nginx/conf.d/radiora.conf..."

sudo tee /etc/nginx/conf.d/radiora.conf > /dev/null << NGINX_EOF
# ── Radiora – Orthanc PACS ───────────────────────────────────────────────────
server {
    listen 80;
    server_name ${ORTHANC_DOMAIN};

    client_max_body_size 500M;
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;

    location / {
        proxy_pass         http://127.0.0.1:8042;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    \$http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}

# ── Radiora – HIS ────────────────────────────────────────────────────────────
server {
    listen 80;
    server_name ${HIS_DOMAIN};

    location / {
        proxy_pass         http://127.0.0.1:3010;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF

sudo nginx -t
sudo nginx -s reload
echo "      ✓ nginx reloaded"

# ── Step 3: SSL (only if email was provided) ──────────────────────────────────
if [ -n "$EMAIL" ]; then
  echo ""
  echo "[3/3] Obtaining SSL certificates from Let's Encrypt..."

  if ! command -v certbot &> /dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y -qq certbot python3-certbot-nginx
  fi

  sudo certbot --nginx -d "${ORTHANC_DOMAIN}" \
    --email "${EMAIL}" --agree-tos --non-interactive --redirect --quiet

  sudo certbot --nginx -d "${HIS_DOMAIN}" \
    --email "${EMAIL}" --agree-tos --non-interactive --redirect --quiet

  echo "      ✓ SSL certificates obtained"
else
  echo ""
  echo "[3/3] Skipping SSL (no email provided — HTTP only)"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo " ✅  Radiora Services are LIVE!"
echo "============================================================"
echo ""
echo "   🏥  Orthanc PACS  : ${PROTOCOL}://${ORTHANC_DOMAIN}"
echo "   🔍  OHIF Viewer   : ${PROTOCOL}://${ORTHANC_DOMAIN}/ohif/viewer"
echo "   📋  HIS Service   : ${PROTOCOL}://${HIS_DOMAIN}"
echo "   🔗  DICOM port    : ${EC2_IP}:4242"
echo ""
echo "   ── Paste these in your Radiora backend .env ─────────────"
echo "   PACS_URL    = ${PROTOCOL}://${ORTHANC_DOMAIN}"
echo "   HIS_URL     = ${PROTOCOL}://${HIS_DOMAIN}"
echo "   HIS_API_KEY = test-key"
echo "============================================================"
