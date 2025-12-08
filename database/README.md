# Database Service - PostgreSQL

Ce dossier contient la configuration de la base de données PostgreSQL centralisée.

## Structure

```
database/
├── Dockerfile           # Configuration Docker pour PostgreSQL
├── prisma.config.ts     # Configuration Prisma
└── prisma/
    ├── schema.prisma    # Schéma unifié de la base de données
    └── migrations/      # Historique des migrations
```

## Connexion

### Variables d'environnement
- **POSTGRES_USER**: trans
- **POSTGRES_PASSWORD**: trans_password
- **POSTGRES_DB**: trans
- **PORT**: 5432

### URL de connexion
```
postgresql://trans:trans_password@postgres:5432/trans
```

## Commandes utiles

```bash
# Démarrer la base de données
make dev

# Se connecter au shell PostgreSQL
make postgres-shell

# Voir les logs
make postgres-logs

# Interface graphique des données
make prisma-studio
```
