#!/bin/bash

# Configuration
PROJECT_ROOT=$(pwd)
BACKUP_DIR="$HOME/backups/data"

echo "🔙 Sistema de Restauración de Infosistel"
echo "------------------------------------------"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: La carpeta de respaldos no existe ($BACKUP_DIR)"
    exit 1
fi

# List available backups
echo "Respaldos disponibles:"
backups=($(ls -d "$BACKUP_DIR"/backup_* 2>/dev/null | sort -r))

if [ ${#backups[@]} -eq 0 ]; then
    echo "❌ No se encontraron respaldos."
    exit 1
fi

for i in "${!backups[@]}"; do
    echo "[$i] $(basename "${backups[$i]}")"
done

echo "------------------------------------------"
read -p "Ingresa el número del respaldo que deseas restaurar: " choice

if [[ ! "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -ge "${#backups[@]}" ]; then
    echo "❌ Selección inválida."
    exit 1
fi

SELECTED_BACKUP="${backups[$choice]}"

echo "⚠️  ADVERTENCIA: Esto reemplazará la base de datos e imágenes actuales."
read -p "¿Estás seguro de continuar? (s/n): " confirm

if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "❌ Restauración cancelada."
    exit 1
fi

# 1. Restore Database
if [ -f "$SELECTED_BACKUP/dev.db" ]; then
    cp "$SELECTED_BACKUP/dev.db" "$PROJECT_ROOT/prisma/dev.db"
    echo "✅ Base de datos restaurada."
fi

# 2. Restore .env
if [ -f "$SELECTED_BACKUP/.env" ]; then
    cp "$SELECTED_BACKUP/.env" "$PROJECT_ROOT/.env"
    echo "✅ Archivo .env restaurado."
fi

# 3. Restore Images
if [ -f "$SELECTED_BACKUP/uploads.tar.gz" ]; then
    # Clear current uploads
    rm -rf "$PROJECT_ROOT/public/uploads"
    # Extract backup
    tar -xzf "$SELECTED_BACKUP/uploads.tar.gz" -C "$PROJECT_ROOT/public"
    echo "✅ Imágenes (uploads) restauradas."
fi

echo "------------------------------------------"
echo "🎉 ¡Restauración completada con éxito!"
echo "🚀 Reinicia la aplicación si es necesario."
echo "------------------------------------------"
