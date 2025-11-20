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

## Build

**Important**: Le package doit être construit avant d'être utilisé par les autres services.

```bash
npm run build
```

Cela génère le dossier `dist/` avec les fichiers JavaScript compilés et les déclarations TypeScript.

## Utilisation

Dans n'importe quel service, importez depuis `@transv2/shared` :

```typescript
// Import depuis le point d'entrée principal
import { User, UserRole, HashUtils, AppConfig } from '@transv2/shared';

// Ou import depuis des sous-modules spécifiques
import { User, UserRole } from '@transv2/shared/types';
import { HashUtils } from '@transv2/shared/utils';
import { AppConfig } from '@transv2/shared/constants';
```

## Ajout de nouveau code

1. Créez vos fichiers dans le dossier approprié
2. Exportez-les dans l'index.ts du dossier
3. Exécutez `npm run build` pour recompiler le package
4. Le code sera disponible pour tous les services
