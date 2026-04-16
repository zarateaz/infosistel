#!/bin/sh

# scripts/prod-pm2.sh
# Script para cargar variables de entorno y arrancar el servidor Standalone de Next.js.
# Diseñado para funcionar perfectamente en Arch VPS con PM2.

echo "[PROD-START] Cargando entorno de INFOSISTEL..."

# 1. Cargar el archivo .env si existe y exportar variables
if [ -f .env ]; then
  echo "[PROD-START] Leyendo .env..."
  export $(grep -v '^#' .env | xargs)
else
  echo "[PROD-START] ADVERTENCIA: No se encontró el archivo .env"
fi

# 2. Asegurar que NODE_ENV es production
export NODE_ENV=production

# 3. Arrancar el servidor standalone
echo "[PROD-START] Iniciando servidor standalone en puerto 3000..."
node .next/standalone/server.js
