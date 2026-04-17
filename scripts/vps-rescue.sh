#!/bin/bash

# scripts/vps-rescue.sh
# Solución Definitiva para despliegue de INFOSISTEL en Arch VPS.

echo "--- [RESCUE] Iniciando Rescate de INFOSISTEL ---"

# 1. Limpieza total de procesos previos
echo "[RESCUE] Limpiando procesos de PM2..."
pm2 delete all || true

# 2. Configuración de Directorios (Next.js Standalone)
echo "[RESCUE] Preparando estructura de producción..."
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ || true
mkdir -p .next/standalone/.next/static
cp -r .next/static/* .next/standalone/.next/static/ || true

# 3. Creación de Ecosystem especializado
echo "[RESCUE] Generando configuración de despliegue estable..."
cat <<EOF > .next/standalone/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "infosistel",
      script: "server.js",
      cwd: "/home/zarate/infosistel/.next/standalone",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "file:/home/zarate/infosistel/prisma/dev.db",
        JWT_SECRET: "infosistel-key-super-segura-2026",
        ENCRYPTION_KEY: "infosistel-encryption-key-32-chars",
        PORT: 3000,
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
};
EOF

# 4. Lanzamiento Final
echo "[RESCUE] Lanzando servidor en puerto 3000..."
cd /home/zarate/infosistel/.next/standalone
pm2 start ecosystem.config.js
pm2 save

echo "--- [RESCUE] INFOSISTEL está ahora ONLINE ---"
echo "Verifica con: pm2 status"
