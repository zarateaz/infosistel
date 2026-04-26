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

# Asegurar que el directorio de datos existe
mkdir -p data/uploads
sudo chmod -R 777 data || true

# ── 3. Preparar Base de Datos y Dependencias ──
echo "📦 [3/7] Instalando dependencias y sincronizando Base de Datos..."
npm install --production=false --silent

# Mover base de datos a ruta persistente si aún no está allí
if [ ! -f "data/dev.db" ]; then
    if [ -f "dev.db" ]; then
        echo "📦 Migrando dev.db de raíz a data/dev.db..."
        mv dev.db data/dev.db
    elif [ -f "prisma/dev.db" ]; then
        echo "📦 Migrando prisma/dev.db a data/dev.db..."
        mv prisma/dev.db data/dev.db
    else
        echo "📦 Creando base de datos inicial..."
        touch data/dev.db
    fi
fi
sudo chmod 666 data/dev.db || true

# Generar Prisma Client usando la ruta persistente
DATABASE_URL="file:$APP_DIR/data/dev.db" npx prisma generate

# Asegurar permisos de carpetas críticas
sudo chmod 777 data || true
sudo chmod 777 data/uploads || true
sudo chmod 666 data/dev.db || true

# ── 4. Build de producción ──
echo "🔨 [4/7] Construyendo en producción..."
git config --global --add safe.directory "$APP_DIR" || true
rm -rf .next

# Asegurar que los directorios padres permitan el paso (traversal) para otros usuarios (Nginx/PM2)
sudo chmod 755 /home/zarate || true
sudo chmod 755 "$APP_DIR" || true
sudo chmod 755 "$APP_DIR/public" || true

npm run build
echo "✅ Build completado"

# ── 5. Copiar assets al standalone ──
echo "📂 [5/7] Copiando assets al directorio standalone..."
cp -r .next/static    .next/standalone/.next/static
cp -r public/.        .next/standalone/public/
# PREVENIR PÉRDIDA DE DATOS: Asegurar que standalone use la base de datos persistente
mkdir -p .next/standalone/data
# No copiamos, sino que vinculamos o simplemente dejamos que el env var DATABASE_URL mande
# Pero para seguridad, aseguramos que el directorio exista en standalone
ln -snf ../../../data/dev.db .next/standalone/data/dev.db || true
echo "✅ Base de datos vinculada al standalone"

# PERSISTENCIA Y ASSETS
echo "🔄 Asegurando permisos de datos..."
sudo mkdir -p data/uploads
sudo chmod -R 777 data || true

# Vinculamos la base de datos dentro del standalone
mkdir -p .next/standalone/data
ln -snf "$APP_DIR/data/dev.db" .next/standalone/data/dev.db || true

echo "✅ Sistema de persistencia vinculado"

# ── 6. Reiniciar PM2 (Prioridad: levantamos la app primero) ──
echo "🚀 [6/7] Reiniciando la app en PM2 (puerto 3000)..."
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
echo "  • App:   http://localhost:3000 (PM2)"
echo "  • Web:   http://$(curl -s ifconfig.me 2>/dev/null || echo 'tu-ip') (Nginx/Apache)"
echo "  • Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'desconocido')"
echo ""
