#!/bin/bash

# scripts/vps-rescue.sh
# Solución Definitiva para despliegue de INFOSISTEL en Arch VPS.
# Uso: bash scripts/vps-rescue.sh

set -e  # Salir ante cualquier error

echo "=========================================="
echo "  [RESCUE] INFOSISTEL — Deploy Completo  "
echo "=========================================="

PROJECT_DIR="/home/zarate/infosistel"
DB_PATH="${PROJECT_DIR}/prisma/dev.db"

# Claves deben ser IDÉNTICAS a las del ecosystem.config.js
JWT_SECRET="infosistel-jwt-super-secret-key-2026!!"
ENCRYPTION_KEY="696e666f73697374656c2d656e63727970742d6b65792d333262797465733200"

cd "$PROJECT_DIR"

# 1. Limpieza total de procesos previos
echo ""
echo "[1/6] Limpiando procesos PM2 previos..."
pm2 delete all 2>/dev/null || true

# 2. Verificar/Crear la base de datos
echo ""
echo "[2/6] Verificando base de datos..."
if [ ! -f "$DB_PATH" ]; then
  echo "      ⚠️  Base de datos no encontrada, creando..."
  DATABASE_URL="file:${DB_PATH}" \
    npx prisma db push --skip-generate
  echo "      ✅ Base de datos creada"
else
  echo "      ✅ Base de datos encontrada: $DB_PATH"
fi

# 3. Reset del usuario admin en la DB
echo ""
echo "[3/6] Creando/Reseteando usuario admin en la DB..."
DATABASE_URL="file:${DB_PATH}" \
  node "${PROJECT_DIR}/scripts/reset-admin.mjs"

# 4. Configuración de Directorios (Next.js Standalone)
echo ""
echo "[4/6] Preparando estructura de producción (Next.js Standalone)..."
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || echo "      (sin archivos en public/)"
mkdir -p .next/standalone/.next/static
cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || echo "      (sin archivos en .next/static/)"
echo "      ✅ Estructura lista"

# 5. Crear ecosystem.config.js en el standalone con rutas y claves correctas
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
        JWT_SECRET: "${JWT_SECRET}",
        ENCRYPTION_KEY: "${ENCRYPTION_KEY}"
      }
    }
  ]
};
EOFCONFIG
echo "      ✅ ecosystem.config.js actualizado"

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
echo "Credenciales del panel admin:"
echo "  Usuario: admin"
echo "  Password: Admin2026!!"
echo ""
echo "⚠️  IMPORTANTE: Cambia el password después del primer login."
