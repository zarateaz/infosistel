#!/bin/bash
# Arranca Infosistel en la VPS sin tocar productos ni fotos.
# NO hace seed, NO borra data/dev.db, NO borra data/uploads.
set -euo pipefail

APP_DIR="/home/zarate/infosistel"
cd "$APP_DIR"

echo "=== Copia de seguridad (no borra nada) ==="
mkdir -p /home/zarate/backups
STAMP="$(date +%Y%m%d-%H%M%S)"
if [ -f data/dev.db ]; then
  cp -a data/dev.db "/home/zarate/backups/dev.db.$STAMP"
  echo "DB copiada a /home/zarate/backups/dev.db.$STAMP"
else
  echo "AVISO: no hay data/dev.db — busca prisma/dev.db o backups"
  ls -lah data prisma /home/zarate/backups 2>/dev/null || true
fi

echo "=== Instalar dependencias de build ==="
# El .env pone NODE_ENV=production y npm se salta Tailwind. Hay que quitarlo.
unset NODE_ENV
npm install --include=dev

echo "=== Prisma: generar cliente y sincronizar esquema ==="
# Requiere que JWT_SECRET, ENCRYPTION_KEY y DNI_HMAC_SECRET ya estén exportados
# en el entorno (ver ecosystem.config.js). db push agrega columnas/tablas nuevas
# (dniSearchHash, CashboxTransaction, etc.) sin tocar los datos existentes.
DATABASE_URL="file:$APP_DIR/data/dev.db" npx prisma generate
DATABASE_URL="file:$APP_DIR/data/dev.db" npx prisma db push --skip-generate

echo "=== Build (si esto falla, NO sigas a PM2) ==="
NODE_ENV=production npm run build

if [ ! -f .next/standalone/server.js ]; then
  echo "ERROR: no existe .next/standalone/server.js — el build no terminó."
  exit 1
fi

echo "=== Copiar estáticos (no toca data/) ==="
mkdir -p .next/standalone/.next .next/standalone/public .next/standalone/data
cp -r .next/static .next/standalone/.next/static
cp -r public/. .next/standalone/public/
# Enlace a la misma DB de siempre — no se copia ni se reemplaza el archivo
if [ -f "$APP_DIR/data/dev.db" ]; then
  ln -snf "$APP_DIR/data/dev.db" .next/standalone/data/dev.db
fi

echo "=== PM2 ==="
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

for v in JWT_SECRET ENCRYPTION_KEY DNI_HMAC_SECRET; do
  if [ -z "${!v:-}" ]; then
    echo "ERROR: $v no está definido en el entorno. Expórtalo antes de correr este script."
    exit 1
  fi
done

npx pm2 delete infosistel 2>/dev/null || true
npx pm2 start ecosystem.config.js --update-env
npx pm2 save
npx pm2 list
curl -sI http://127.0.0.1:3000 | head -n 5
echo "Listo. Productos y fotos siguen en data/dev.db y data/uploads."
