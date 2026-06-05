#!/bin/bash

# Script de despliegue para Jordan Portal (jordanstarter.es)
# Este script sube los cambios a GitHub (git) y los despliega en el servidor de producción (rsync).

# Detener el script ante cualquier error
set -e

# Configuración
SSH_KEY="~/.ssh/hestia_inteligenciasevilla"
SERVER_USER="inteligenciasevilla"
SERVER_HOST="ns1.forgenex.com"
PORT="22"
REMOTE_PATH="/home/inteligenciasevilla/web/jordanstarter.es/public_html"
BRANCH="main"

echo "========================================================="
echo "🚀 Iniciando despliegue de Jordan Portal (jordanstarter.es)..."
echo "========================================================="

# 1. Actualizar repositorio Git (GitHub)
if [ -d .git ]; then
    echo "Comprobando estado de Git..."
    
    # Asegurarnos de que estamos en la rama correcta
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
        echo "Cambiando a la rama $BRANCH..."
        git checkout "$BRANCH"
    fi

    if [[ -n $(git status -s) ]]; then
        echo "Detectados cambios locales sin confirmar."
        
        # Obtener el mensaje de commit
        COMMIT_MSG="$1"
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Actualización automática: $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        
        echo "Confirmando cambios con el mensaje: '$COMMIT_MSG'..."
        git add .
        git commit -m "$COMMIT_MSG"
        
        echo "Subiendo cambios a GitHub en la rama '$BRANCH'..."
        git push origin "$BRANCH"
        echo "✓ Cambios subidos a GitHub."
    else
        echo "✓ No hay cambios pendientes en Git o ya están subidos."
    fi
else
    echo "⚠ Directorio .git no encontrado. Saltando paso de Git."
fi

# 2. Verificar conexión SSH antes de transferir
echo "🔌 Verificando conexión SSH con $SERVER_HOST..."
ssh -i $SSH_KEY -p $PORT -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$SERVER_USER@$SERVER_HOST" exit >/dev/null 2>&1
if [ $? -ne 0 ]; then
    # Intentar con la IP por si acaso
    SERVER_HOST_ALT="195.7.5.194"
    echo "⚠️  Conexión a $SERVER_HOST fallida. Probando con IP alternativa $SERVER_HOST_ALT..."
    ssh -i $SSH_KEY -p $PORT -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$SERVER_USER@$SERVER_HOST_ALT" exit >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        SERVER_HOST=$SERVER_HOST_ALT
    else
        echo "❌ Error: No se pudo establecer conexión SSH con el servidor."
        exit 1
    fi
fi

# 3. Desplegar al servidor vía rsync
echo "🔄 Sincronizando archivos con el servidor de producción vía rsync..."
rsync -avz -e "ssh -i $SSH_KEY -p $PORT -o StrictHostKeyChecking=accept-new" \
  --exclude=".git/" \
  --exclude=".github/" \
  --exclude=".vscode/" \
  --exclude=".DS_Store" \
  --exclude="deploy.sh" \
  --delete \
  ./ "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
    echo "========================================================="
    echo "🎉 ¡Despliegue completado con éxito!"
    echo "Jordan Portal actualizado en: https://jordanstarter.es"
    echo "========================================================="
else
    echo "❌ Error durante la sincronización de archivos."
    exit 1
fi
