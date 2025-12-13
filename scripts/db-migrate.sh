#!/bin/bash
set -e

echo "🔍 Vérification de la base de données..."

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U trans > /dev/null 2>&1; then
        echo "✅ PostgreSQL est prêt"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Timeout: PostgreSQL n'est pas disponible"
        exit 1
    fi
    sleep 1
done

# Vérifier si les tables existent
echo "🔍 Vérification des tables..."
TABLE_COUNT=$(docker compose exec -T postgres psql -U trans -d trans -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")

if [ "$TABLE_COUNT" -eq "0" ]; then
    echo "📦 Tables non trouvées, lancement de la migration..."
    cd database && DATABASE_URL="postgres://trans:trans_password@localhost:5432/trans" npx prisma db push --accept-data-loss
    echo "✅ Migration terminée"
else
    echo "✅ Tables déjà présentes ($TABLE_COUNT tables)"
fi

echo "✨ Base de données prête!"
