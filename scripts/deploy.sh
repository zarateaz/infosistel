#!/bin/bash
# ═══════════════════════════════════════════════════════
#  deploy.sh — Script de despliegue Infosistel en VPS Hostinger
#  Usuario: angel | Puerto: 3002 (PM2) | Proxy: Nginx 80 → 3002
# ═══════════════════════════════════════════════════════
set -e

# ── Identificar el directorio de la app dinámicamente ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
PM2_NAME="infosistel"
NGINX_CONF="/etc/nginx/conf.d/infosistel.conf"

echo "Detected APP_DIR: $APP_DIR"


echo ""
echo "╔════════════════════════════════════════╗"
echo "║   INFOSISTEL — Deploy en producción    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# ── 1. Ir al directorio de la app ──
echo "📁 [1/7] Entrando al directorio..."
cd "$APP_DIR"

# ── 2. Pull de los últimos cambios ──
echo "🔄 [2/7] Actualizando código desde GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Código actualizado: $(git log --oneline -1)"

# ── 3. Preparar Base de Datos y Dependencias ──
echo "📦 [3/7] Instalando dependencias y sincronizando Base de Datos..."
npm install --production=false --silent
npx prisma generate
DATABASE_URL="file:/home/angel/infosistel/prisma/dev.db" npx prisma db push --accept-data-loss

# ── 4. Build de producción ──
echo "🔨 [4/7] Construyendo en producción..."
npm run build
echo "✅ Build completado"

# ── 5. Copiar assets al standalone ──
echo "📂 [5/7] Copiando assets al directorio standalone..."
cp -r .next/static    .next/standalone/.next/static
cp -r public/.        .next/standalone/public/
echo "✅ Assets copiados"

# ── 6. Actualizar Nginx ──
echo "🌐 [6/7] Actualizando configuración de Nginx..."

# Crear una versión temporal de nginx.conf con las rutas correctas para este VPS
TEMP_NGINX="/tmp/infosistel_nginx.conf"
sed "s|/home/angel/infosistel|$APP_DIR|g" "$APP_DIR/nginx.conf" > "$TEMP_NGINX"

sudo cp "$TEMP_NGINX" "$NGINX_CONF"
rm "$TEMP_NGINX"


# Verificar que la config sea válida antes de recargar
if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx
    echo "✅ Nginx recargado con nueva configuración de seguridad"
else
    echo "⚠️  Error en nginx.conf — revisa manualmente con: nginx -t"
    echo "   La app seguirá funcionando con la config anterior"
fi

# ── 7. Reiniciar PM2 ──
echo "🚀 [7/7] Reiniciando la app en PM2 (puerto 3002)..."
pm2 restart "$PM2_NAME" || pm2 start ecosystem.config.js
pm2 save
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Deploy completado exitosamente    ║"
echo "╚════════════════════════════════════════╝"
echo ""
pm2 list
echo ""
echo "📊 Estado de servicios:"
echo "  • App:   http://localhost:3002 (PM2)"
echo "  • Web:   http://$(curl -s ifconfig.me 2>/dev/null || echo 'tu-ip') (Nginx)"
echo "  • Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'desconocido')"
echo ""
