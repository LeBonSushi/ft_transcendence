# @transv2/shared

Code partagé pour tous les microservices de TRANSv2.

## Structure

```
shared/
├── types/          # Types TypeScript partagés
├── dtos/           # Data Transfer Objects
├── utils/          # Fonctions utilitaires
├── constants/      # Constantes et configuration
└── index.ts        # Point d'entrée principal
```

## Utilisation

Dans n'importe quel service, importez depuis `@transv2/shared` :

```typescript
import { User, UserRole, ErrorCodes, Validators } from '@transv2/shared';
```

## Ajout de nouveau code

1. Créez vos fichiers dans le dossier approprié
2. Exportez-les dans l'index.ts du dossier
3. Le code sera disponible pour tous les services
