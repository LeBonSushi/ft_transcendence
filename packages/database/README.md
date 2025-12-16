# Database Package - Prisma 7

## ⚠️ Important - Prisma 7 Changes

Dans Prisma 7, la configuration de la datasource a changé :

### ❌ Plus de `url` dans schema.prisma

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  // N'ajoutez PAS url ici !
}
```

### ✅ `datasourceUrl` dans PrismaClient

```typescript
// index.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});
```

## 🚀 Quick Start

```bash
# 1. Générer le client Prisma
pnpm generate

# 2. Créer une migration
pnpm migrate

# 3. Appliquer directement (sans migration)
pnpm push

# 4. Seed la database
pnpm seed

# 5. Ouvrir Prisma Studio
pnpm studio
```

## 📋 Scripts disponibles

- `pnpm generate` - Génère le Prisma Client
- `pnpm migrate` - Crée et applique une migration
- `pnpm push` - Push le schema sans créer de migration
- `pnpm seed` - Seed la database avec des données de test
- `pnpm studio` - Ouvre Prisma Studio (GUI)
- `pnpm reset` - Reset la database (⚠️ supprime toutes les données)

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travel_planner?schema=public"
```

### Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Schéma Prisma
│   ├── migrations/        # Migrations
│   ├── seed.ts           # Script de seed
│   └── prisma.config.ts  # Config Prisma 7 (optionnel)
├── index.ts              # Export du PrismaClient
└── package.json
```

## 🐛 Troubleshooting

### Erreur: "Module '@prisma/client' has no exported member 'PrismaClient'"

**Solution**: Régénérez le client Prisma

```bash
pnpm generate
```

### Erreur: "The datasource property `url` is no longer supported"

**Solution**: Retirez `url` du schema.prisma et ajoutez `datasourceUrl` au PrismaClient

```typescript
// ❌ NE PAS faire
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ✅ Faire
datasource db {
  provider = "postgresql"
}

// Et dans index.ts:
new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})
```

### La base de données n'est pas accessible

**Vérifiez que PostgreSQL est démarré:**

```bash
docker ps | grep postgres
```

**Redémarrez si nécessaire:**

```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

## 📚 Ressources

- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
