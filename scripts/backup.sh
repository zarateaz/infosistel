#!/bin/bash

# Configuration
PROJECT_ROOT=$(pwd)
BACKUP_DIR="$HOME/backups/data"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CURRENT_BACKUP="$BACKUP_DIR/backup_$TIMESTAMP"

# Create backup directory
mkdir -p "$CURRENT_BACKUP"

echo "🚀 Iniciando respaldo inteligente de Infosistel..."

# 1. Back up Database
if [ -f "$PROJECT_ROOT/prisma/dev.db" ]; then
    cp "$PROJECT_ROOT/prisma/dev.db" "$CURRENT_BACKUP/dev.db"
    echo "✅ Base de datos respaldada."
else
    echo "❌ Error: No se encontró prisma/dev.db"
fi

# 2. Back up Environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    cp "$PROJECT_ROOT/.env" "$CURRENT_BACKUP/.env"
    echo "✅ Archivo .env respaldado."
fi

# 3. Back up Uploaded Images
if [ -d "$PROJECT_ROOT/public/uploads" ]; then
    tar -czf "$CURRENT_BACKUP/uploads.tar.gz" -C "$PROJECT_ROOT/public" uploads
    echo "✅ Imágenes (uploads) comprimidas y respaldadas."
else
    echo "⚠️ Advertencia: No se encontró la carpeta public/uploads"
fi

# 4. Cleanup - Keep only last 10 backups
cd "$BACKUP_DIR" && ls -t | tail -n +11 | xargs rm -rf -- 2>/dev/null

echo "------------------------------------------"
echo "🎉 ¡Respaldo completado con éxito!"
echo "📍 Ubicación: $CURRENT_BACKUP"
echo "------------------------------------------"
