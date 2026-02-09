# Environment Variables

Toutes les variables d'environnement sont maintenant centralisées dans **`/.env`** à la racine du projet.

## Configuration

1. Copiez le fichier `.env.example` :
   ```bash
   cp .env.example .env
   ```

2. Éditez `.env` avec vos valeurs :
   ```bash
   nano .env  # ou votre éditeur préféré
   ```

## Variables importantes

### Base de données
- `DATABASE_URL` : URL de connexion PostgreSQL

### Authentication (NextAuth)
- `NEXTAUTH_SECRET` : Secret pour signer les tokens JWT
- `NEXTAUTH_URL` : URL de votre application frontend

### OAuth Providers
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

### Backend
- `BACKEND_PORT` : Port du serveur NestJS (défaut: 4000)
- `JWT_SECRET` : Secret pour les JWT côté backend

### Frontend
- `NEXT_PUBLIC_API_URL` : URL de l'API backend
- `NEXT_PUBLIC_WS_URL` : URL WebSocket

## Notes

- Les variables préfixées par `NEXT_PUBLIC_` sont exposées côté client
- Ne jamais commit le fichier `.env` (il est dans .gitignore)
- Utilisez `.env.example` comme template
