#!/bin/bash

# Charger les variables d'environnement
source .env.local 2>/dev/null || true

# Vérifier si NGROK_DOMAIN est défini
if [ -z "$NGROK_DOMAIN" ]; then
  echo "⚠️  NGROK_DOMAIN non défini dans .env.local"
  echo "🚀 Lancement sans ngrok..."
  concurrently -n "backend,web" -c "blue,magenta" "pnpm --filter backend dev" "pnpm --filter web dev"
  exit 0
fi

# Vérifier si le domaine ngrok est déjà actif
echo "🔍 Vérification si ngrok est déjà actif sur $NGROK_DOMAIN..."
if curl -s --max-time 3 "https://$NGROK_DOMAIN" > /dev/null 2>&1; then
  echo "✅ Ngrok déjà actif sur $NGROK_DOMAIN"
  echo "🚀 Lancement backend + web uniquement..."
  concurrently -n "backend,web" -c "blue,magenta" "pnpm --filter backend dev" "pnpm --filter web dev"
else
  echo "❌ Ngrok non actif"
  echo "🚀 Lancement backend + web + ngrok..."
  concurrently -n "backend,web,ngrok" -c "blue,magenta,green" \
    "pnpm --filter backend dev" \
    "pnpm --filter web dev" \
    "ngrok http 4000 --authtoken $NGROK_SECRET_KEY --domain $NGROK_DOMAIN"
fi
