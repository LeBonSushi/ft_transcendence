# Frontend - Next.js 15 + shadcn/ui

## Setup Instructions

### 1. Install shadcn/ui

```bash
cd apps/web

# Initialize shadcn/ui
npx shadcn@latest init

# When prompted, choose:
# - Style: Default
# - Color: Slate
# - CSS variables: Yes
# - Tailwind config: Yes
# - Components path: @/components
# - Utils path: @/lib/utils
# - React Server Components: Yes
```

### 2. Add shadcn/ui Components

```bash
# Essential components for the app
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add scroll-area
```

### 3. Create API Client

Create `src/lib/api-client.ts`:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Create Socket.io Client

Create `src/lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@travel-planner/shared';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const getSocket = () => socket;

export { SOCKET_EVENTS };
```

### 5. Page Structure

Create these pages:

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── rooms/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── friends/
│       └── page.tsx
├── layout.tsx
└── page.tsx
```

### 6. State Management with Zustand

Create `src/lib/store.ts`:

```typescript
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  profile: any;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Features to Implement

### Authentication Pages
- [x] Login page with email/password
- [x] Register page
- [x] OAuth buttons (Google, GitHub, 42)
- [ ] Password reset

### Dashboard
- [ ] Room list
- [ ] Create room modal
- [ ] Room details
- [ ] Trip proposals
- [ ] Voting interface
- [ ] Activity suggestions

### Real-time Chat
- [ ] Chat sidebar
- [ ] Message list
- [ ] Send message
- [ ] Typing indicators
- [ ] Online presence

### Profile
- [ ] View profile
- [ ] Edit profile
- [ ] Upload profile picture
- [ ] Friend list

## Folder Structure

```
src/
├── app/                 # Next.js app router
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── chat/           # Chat components
│   ├── room/           # Room components
│   └── layout/         # Layout components
├── lib/
│   ├── api-client.ts   # Axios client
│   ├── socket.ts       # Socket.io client
│   ├── utils.ts        # Utility functions
│   └── store.ts        # Zustand store
└── hooks/
    ├── use-socket.ts   # Socket hook
    ├── use-auth.ts     # Auth hook
    └── use-chat.ts     # Chat hook
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Zustand](https://zustand-demo.pmnd.rs/)
