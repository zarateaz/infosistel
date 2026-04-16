#!/bin/sh
set -e

echo "[ENTRYPOINT] Iniciando servidor de INFOSISTEL..."

# 1. Aplicar migraciones si es necesario
echo "[ENTRYPOINT] Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# 2. Generar el cliente de Prisma (por seguridad, aunque ya se hizo en el build)
echo "[ENTRYPOINT] Generando cliente de Prisma..."
npx prisma generate

# 3. Arrancar la aplicación (usando el servidor standalone de Next.js)
echo "[ENTRYPOINT] Arrancando aplicación con Node.js..."
exec node server.js
