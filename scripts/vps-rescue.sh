#!/bin/bash

# scripts/vps-rescue.sh
# Solución Definitiva para despliegue de INFOSISTEL en Arch VPS.
#
# SECURITY FIX (VULN-02): All secrets removed from this script.
# Set JWT_SECRET and ENCRYPTION_KEY as real environment variables before running.
#
# HOW TO SET SECRETS (run once on the VPS):
#   export JWT_SECRET="$(openssl rand -base64 64)"
#   export ENCRYPTION_KEY="$(openssl rand -hex 32)"
#   echo "export JWT_SECRET='$JWT_SECRET'" >> ~/.bashrc
#   echo "export ENCRYPTION_KEY='$ENCRYPTION_KEY'" >> ~/.bashrc
#
# Uso: bash scripts/vps-rescue.sh

set -e  # Salir ante cualquier error

echo "=========================================="
echo "  [RESCUE] INFOSISTEL — Deploy Completo  "
echo "=========================================="

PROJECT_DIR="/home/zarate/infosistel"
DB_PATH="${PROJECT_DIR}/data/dev.db"

# ── Validate that secrets are set as environment variables ──
if [ -z "$JWT_SECRET" ]; then
  echo "❌ ERROR: JWT_SECRET no está definido como variable de entorno."
  echo "   Ejecuta: export JWT_SECRET=\"\$(openssl rand -base64 64)\""
  exit 1
fi

if [ -z "$ENCRYPTION_KEY" ]; then
  echo "❌ ERROR: ENCRYPTION_KEY no está definido como variable de entorno."
  echo "   Ejecuta: export ENCRYPTION_KEY=\"\$(openssl rand -hex 32)\""
  exit 1
fi

if [ -z "$DNI_HMAC_SECRET" ]; then
  echo "❌ ERROR: DNI_HMAC_SECRET no está definido como variable de entorno."
  echo "   Ejecuta: export DNI_HMAC_SECRET=\"\$(openssl rand -hex 32)\""
  exit 1
fi

echo "✅ Secretos de entorno verificados."

cd "$PROJECT_DIR"

# 1. Limpieza total de procesos previos
echo ""
echo "[1/6] Limpiando procesos PM2 previos..."
pm2 delete all 2>/dev/null || true

# 2. Verificar/Crear la base de datos
echo ""
echo "[2/6] Verificando base de datos..."
mkdir -p "$(dirname "$DB_PATH")"
if [ ! -f "$DB_PATH" ]; then
  echo "      ⚠️  Base de datos no encontrada, creando..."
else
  echo "      ✅ Base de datos encontrada: $DB_PATH"
fi
# Sincroniza el esquema (agrega columnas/tablas nuevas sin borrar datos),
# tanto si la DB es nueva como si ya existe con datos previos.
DATABASE_URL="file:${DB_PATH}" \
  npx prisma db push --skip-generate
echo "      ✅ Esquema de base de datos sincronizado"

# SECURITY FIX (VULN-03): Secure file permissions — NOT 777
chmod 700 "$(dirname "$DB_PATH")"
chmod 600 "$DB_PATH"
echo "      🔒 Permisos 600 aplicados a la base de datos"

# 3. Reset del usuario admin en la DB (password from arg or prompt)
echo ""
echo "[3/6] Configurando usuario admin..."
if [ -n "$ADMIN_USERNAME" ] && [ -n "$ADMIN_PASSWORD" ]; then
  DATABASE_URL="file:${DB_PATH}" \
    node "${PROJECT_DIR}/scripts/reset-admin.mjs" "$ADMIN_USERNAME" "$ADMIN_PASSWORD"
else
  echo "      ℹ️  No se configuró admin. Para crear uno:"
  echo "         node scripts/reset-admin.mjs <username> <password>"
fi

# 4. Configuración de Directorios (Next.js Standalone)
echo ""
echo "[4/6] Preparando estructura de producción (Next.js Standalone)..."
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || echo "      (sin archivos en public/)"
mkdir -p .next/standalone/.next/static
cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || echo "      (sin archivos en .next/static/)"
echo "      ✅ Estructura lista"

# 5. Generar ecosystem.config.js de producción (sin secrets hardcodeados)
echo ""
echo "[5/6] Generando ecosystem.config.js de producción..."
cat > "${PROJECT_DIR}/ecosystem.config.js" << EOFCONFIG
module.exports = {
  apps: [
    {
      name: "infosistel",
      script: ".next/standalone/server.js",
      cwd: "${PROJECT_DIR}",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "file:${DB_PATH}",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        COOKIE_SECURE: "true",
        JWT_SECRET: "${JWT_SECRET}",
        ENCRYPTION_KEY: "${ENCRYPTION_KEY}",
        DNI_HMAC_SECRET: "${DNI_HMAC_SECRET}"
      }
    }
  ]
};
EOFCONFIG
chmod 600 "${PROJECT_DIR}/ecosystem.config.js"
echo "      ✅ ecosystem.config.js actualizado (permisos 600)"

# 6. Lanzamiento Final con PM2
echo ""
echo "[6/6] Lanzando servidor con PM2..."
pm2 start "${PROJECT_DIR}/ecosystem.config.js"
pm2 save

echo ""
echo "=========================================="
echo "  ✅ INFOSISTEL está ahora ONLINE        "
echo "=========================================="
echo ""
echo "Verifica el estado con: pm2 status"
echo "Ver logs con: pm2 logs infosistel --lines 50"
echo ""
echo "⚠️  IMPORTANTE: Los secretos se cargaron desde variables de entorno."
echo "   Nunca los almacenes en código fuente ni los compartas."
