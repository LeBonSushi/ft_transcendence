# API Client Documentation

Ce dossier contient le client API pour communiquer avec l'API Gateway du backend.

## Architecture

### Backend - API Gateway

L'API Gateway est un module global qui intercepte toutes les requêtes et gère :
- ✅ **Authentification JWT automatique** via cookies HTTP-only
- ✅ **Logging des requêtes** (méthode, URL, durée, utilisateur, IP)
- ✅ **Gestion des erreurs** centralisée
- ✅ **Protection des routes** par défaut (sauf celles marquées `@Public()`)

**Localisation Backend**: `apps/backend/src/common/gateway/`

### Frontend - Client API

Le client API côté frontend utilise Axios avec:
- ✅ **Configuration automatique** des headers
- ✅ **Gestion des cookies** (credentials: true)
- ✅ **Intercepteurs** pour les requêtes et réponses
- ✅ **Types TypeScript** partagés depuis `@travel-planner/shared`

## Utilisation

### 1. Authentification

```typescript
import { authApi } from '@/lib/api';

// Inscription
const result = await authApi.register({
  email: 'user@example.com',
  password: 'securePassword123',
  username: 'johndoe',
  displayName: 'John Doe'
});

// Connexion
const result = await authApi.login({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Récupérer l'utilisateur actuel
const user = await authApi.getCurrentUser();

// Déconnexion
await authApi.logout();

// OAuth (Google, GitHub, 42)
authApi.loginWithGoogle(); // Redirige vers Google OAuth
authApi.loginWithGithub(); // Redirige vers GitHub OAuth
authApi.loginWith42();     // Redirige vers 42 OAuth
```

### 2. Utilisateurs

```typescript
import { usersApi } from '@/lib/api';

// Récupérer un utilisateur
const user = await usersApi.getUser('user-id');

// Mettre à jour le profil
await usersApi.updateProfile('user-id', {
  displayName: 'New Name',
  bio: 'Updated bio',
  avatarUrl: 'https://...'
});

// Récupérer les rooms d'un utilisateur
const rooms = await usersApi.getUserRooms('user-id');

// Récupérer les amis d'un utilisateur
const friends = await usersApi.getUserFriends('user-id');
```

### 3. Rooms (Salons de voyage)

```typescript
import { roomsApi } from '@/lib/api';

// Créer une room
const room = await roomsApi.createRoom({
  name: 'Trip to Paris',
  description: 'Planning our summer vacation',
  isPrivate: true
});

// Rejoindre une room
await roomsApi.joinRoom('room-id');

// Créer une proposition de voyage
const proposal = await roomsApi.createProposal('room-id', {
  destination: 'Paris, France',
  startDate: '2025-07-01',
  endDate: '2025-07-15',
  description: 'Summer vacation',
  estimatedBudget: 2000
});

// Voter sur une proposition
await roomsApi.voteOnProposal('room-id', 'proposal-id', {
  voteType: 'YES' // 'YES' | 'NO' | 'MAYBE'
});
```

### 4. Messages

```typescript
import { messagesApi } from '@/lib/api';

// Récupérer les messages d'une room
const messages = await messagesApi.getMessages('room-id', 50, 0);

// Envoyer un message
const message = await messagesApi.sendMessage('room-id', {
  content: 'Hello everyone!',
  type: 'TEXT'
});

// Supprimer un message
await messagesApi.deleteMessage('room-id', 'message-id');
```

### 5. Amis

```typescript
import { friendsApi } from '@/lib/api';

// Récupérer les demandes d'ami
const requests = await friendsApi.getFriendRequests();

// Envoyer une demande d'ami
await friendsApi.sendFriendRequest('user-id');

// Accepter une demande
await friendsApi.acceptFriendRequest('friendship-id');

// Rejeter une demande
await friendsApi.rejectFriendRequest('friendship-id');

// Supprimer un ami
await friendsApi.removeFriend('friendship-id');

// Bloquer un utilisateur
await friendsApi.blockFriend('friendship-id');
```

### 6. Upload de fichiers

```typescript
import { storageApi } from '@/lib/api';

// Upload photo de profil
const result = await storageApi.uploadProfilePicture(file);
console.log(result.url); // URL du fichier uploadé

// Upload image de room
const result = await storageApi.uploadRoomImage(file);

// Upload pièce jointe de message
const result = await storageApi.uploadMessageAttachment(file);
```

## Gestion des erreurs

Le client API gère automatiquement les erreurs courantes:

```typescript
import { authApi } from '@/lib/api';

try {
  const user = await authApi.getCurrentUser();
} catch (error) {
  if (error.response?.status === 401) {
    // Non authentifié - rediriger vers login
    router.push('/login');
  } else if (error.response?.status === 403) {
    // Accès interdit
    console.error('Access forbidden');
  } else if (error.response?.status === 404) {
    // Ressource non trouvée
    console.error('Not found');
  } else {
    // Autre erreur
    console.error('An error occurred:', error.message);
  }
}
```

## Configuration

Le client API utilise les variables d'environnement suivantes:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Routes protégées vs publiques

### Routes publiques (pas d'authentification requise)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google` + callback
- `GET /auth/github` + callback
- `GET /auth/42` + callback

### Routes protégées (authentification JWT requise)
Toutes les autres routes nécessitent un token JWT valide dans les cookies.

L'API Gateway vérifie automatiquement:
1. Présence du token dans les cookies (`access_token`)
2. OU présence du token dans le header `Authorization: Bearer <token>`
3. Validité du token (signature, expiration)
4. Attache les informations utilisateur à la requête

## Types TypeScript

Tous les types sont partagés depuis le package `@travel-planner/shared`:

```typescript
import type {
  User,
  Room,
  Message,
  TripProposal,
  Friendship
} from '@travel-planner/shared';
```

## WebSocket (à venir)

Pour les fonctionnalités temps réel (chat, notifications), voir la documentation WebSocket.
