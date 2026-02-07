# Centralisation des variables d'environnement

## ✅ Configuration unique à la racine

Toutes les variables d'environnement sont maintenant dans **`/.env`** à la racine du projet.

### Fichiers modifiés

1. **`apps/web/next.config.ts`** : Configure dotenv pour charger `/.env`
2. **`apps/backend/src/app.module.ts`** : Déjà configuré pour `../../.env`
3. **`packages/database/prisma.config.ts`** : Déjà configuré pour `../../.env`

### Structure

```
TRANSv2/
├── .env                    ← Fichier unique pour toutes les variables
├── .env.example            ← Template à copier
├── apps/
│   ├── backend/           ← Utilise /.env
│   └── web/               ← Utilise /.env
└── packages/
    └── database/          ← Utilise /.env
```

### Variables disponibles

- **Database** : `DATABASE_URL`
- **NextAuth** : `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **OAuth** : Google, GitHub credentials
- **Backend** : `BACKEND_PORT`, `JWT_SECRET`, `REDIS_*`
- **Frontend** : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`
- **Storage** : S3/MinIO configuration

## 🎯 Utilisation

```bash
# 1. Copier le template
cp .env.example .env

# 2. Éditer vos valeurs
nano .env

# 3. Lancer l'application (tous les services utilisent le même .env)
pnpm dev
```

**Note** : Plus besoin de fichiers `.env.local` dans les sous-dossiers !
