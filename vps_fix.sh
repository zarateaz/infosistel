#!/bin/bash
# ═══════════════════════════════════════════════════════
#  vps_fix.sh — Renueva el SSL caducado y recarga Nginx
#  Uso (YA DENTRO de la VPS, no en el prompt de password):
#    cd /home/zarate/infosistel && bash vps_fix.sh
# ═══════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="infosistel.com.pe"
WWW="www.infosistel.com.pe"
WEBROOT="/var/www/certbot"
NGINX_CONF="/etc/nginx/conf.d/infosistel.conf"

if [ "$(id -u)" -ne 0 ]; then
  echo "Este script necesita root. Ejecuta: sudo bash vps_fix.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR"

echo "╔════════════════════════════════════════╗"
echo "║  INFOSISTEL — arreglo SSL Let's Encrypt║"
echo "╚════════════════════════════════════════╝"
echo "App: $APP_DIR"
echo ""

mkdir -p "$WEBROOT"
chmod 755 "$WEBROOT"

if [ ! -f "$APP_DIR/nginx.conf" ]; then
  echo "No encuentro nginx.conf en $APP_DIR"
  exit 1
fi

echo "[1/5] Instalando Certbot si falta..."
if ! command -v certbot >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y certbot
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y certbot
  elif command -v pacman >/dev/null 2>&1; then
    pacman -Sy --noconfirm certbot
  else
    echo "Instala certbot a mano y vuelve a correr este script."
    exit 1
  fi
fi

echo "[2/5] Copiando nginx.conf (incluye ACME en puerto 80)..."
cp "$APP_DIR/nginx.conf" "$NGINX_CONF"
if nginx -t; then
  systemctl reload nginx || systemctl restart nginx
else
  echo "nginx -t falló. Revisa $NGINX_CONF"
  exit 1
fi

echo "[3/5] Renovando certificado..."
if certbot renew --force-renewal --non-interactive; then
  echo "Renovación OK."
else
  echo "renew falló; pidiendo certificado nuevo por HTTP-01 (webroot)..."
  certbot certonly --webroot -w "$WEBROOT" \
    --non-interactive --agree-tos --keep-until-expiry \
    --register-unsafely-without-email \
    -d "$DOMAIN" -d "$WWW"
fi

echo "[4/5] Recargando Nginx..."
nginx -t
systemctl reload nginx || systemctl restart nginx

if command -v systemctl >/dev/null 2>&1; then
  if systemctl list-unit-files | grep -q '^certbot.timer'; then
    systemctl enable --now certbot.timer || true
  fi
fi

echo "[5/5] Fechas del certificado:"
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  openssl x509 -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" -noout -dates -subject
else
  echo "No está el archivo de certificado. Certbot no completó."
  exit 1
fi

echo ""
echo "Listo. Abre https://${WWW} en una ventana de incógnito."
echo "Si PM2 está caído: cd $APP_DIR && npx pm2 restart infosistel || npx pm2 start ecosystem.config.js"
