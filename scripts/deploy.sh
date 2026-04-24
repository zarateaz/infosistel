#!/bin/bash
# ═══════════════════════════════════════════════════════
#  deploy.sh — Script de despliegue Infosistel en VPS Hostinger
#  Usuario: angel | Puerto: 3002 (PM2) | Proxy: Nginx/Apache 80 → 3002
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
DATABASE_URL="file:$APP_DIR/prisma/dev.db" npx prisma generate

# ── 4. Build de producción ──
echo "🔨 [4/7] Construyendo en producción..."
git config --global --add safe.directory "$APP_DIR" || true
rm -rf .next

# Asegurar que los directorios padres permitan el paso (traversal) para otros usuarios (Nginx/PM2)
sudo chmod 755 /home/zarate || true
sudo chmod 755 "$APP_DIR" || true
sudo chmod 755 "$APP_DIR/public" || true

# Asegurar que el directorio de uploads exista y tenga permisos de escritura
mkdir -p public/uploads
sudo chmod -R 777 public/uploads || true
sudo chmod 777 prisma || true
sudo chmod 666 prisma/dev.db || true

npm run build

echo "✅ Build completado"

# ── 5. Copiar assets al standalone ──
echo "📂 [5/7] Copiando assets al directorio standalone..."
cp -r .next/static    .next/standalone/.next/static
cp -r public/.        .next/standalone/public/
mkdir -p .next/standalone/prisma

# PREVENIR PÉRDIDA DE DATOS: Solo copiar DB local si la de producción no existe
if [ ! -f ".next/standalone/prisma/dev.db" ]; then
    echo "⚠️ Primera vez: Copiando base de datos inicial a standalone..."
    cp prisma/dev.db .next/standalone/prisma/dev.db || true
else
    echo "✅ Base de datos de producción existente. SALVAGUARDADA (no se sobrescribirá)."
fi

# PREVENIR PÉRDIDA DE IMÁGENES: Asegurar que uploads antiguos sobrevivan (por si public/. sobrescribió con vacío)
if [ -d "public/uploads" ]; then
    cp -rn public/uploads/* .next/standalone/public/uploads/ 2>/dev/null || true
fi
echo "✅ Assets copiados y data salvaguardada"

# ── 6. Reiniciar PM2 (Prioridad: levantamos la app primero) ──
echo "🚀 [6/7] Reiniciando la app en PM2 (puerto 3001)..."
# Usar npx para asegurar que pm2 se encuentre si no está en el PATH global
npx pm2 restart "$PM2_NAME" || npx pm2 start ecosystem.config.js
npx pm2 save
echo "✅ App reiniciada"

# ── 7. Actualizar Nginx (Opcional, si el directorio existe) ──
echo "🌐 [7/7] Intentando actualizar configuración de Nginx..."

if [ -d "$(dirname "$NGINX_CONF")" ]; then
    # Crear una versión temporal de nginx.conf con las rutas correctas para este VPS
    TEMP_NGINX="/tmp/infosistel_nginx.conf"
    sed "s|/home/zarate/infosistel|$APP_DIR|g" "$APP_DIR/nginx.conf" > "$TEMP_NGINX"
    
    if sudo cp "$TEMP_NGINX" "$NGINX_CONF" 2>/dev/null; then
        rm "$TEMP_NGINX"
        # Verificar que la config sea válida antes de recargar
        if sudo nginx -t 2>/dev/null; then
            sudo systemctl reload nginx
            echo "✅ Nginx recargado con nueva configuración"
        else
            echo "⚠️  Error en nginx.conf — revisa manualmente con: nginx -t"
        fi
    else
        echo "⚠️  No se pudo copiar a $NGINX_CONF (¿falta sudo?)"
    fi
else
    echo "⚠️  Saltando Nginx: El directorio $(dirname "$NGINX_CONF") no existe."
    echo "   Asegúrate de que Nginx esté instalado y configurado manualmente si es necesario."
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Deploy completado exitosamente    ║"
echo "╚════════════════════════════════════════╝"
echo ""
npx pm2 list
echo ""
echo "📊 Estado de servicios:"
echo "  • App:   http://localhost:3001 (PM2)"
echo "  • Web:   http://$(curl -s ifconfig.me 2>/dev/null || echo 'tu-ip') (Nginx/Apache)"
echo "  • Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'desconocido')"
echo ""
