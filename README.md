# 🌍 Travel Planner - Modern Trip Planning Platform

A scalable, production-ready travel planning platform built with modern technologies. Plan trips with friends, vote on destinations, manage activities, and chat in real-time.

## 🏗️ Architecture

**Modern Modular Monolith** - Built for 1000s of concurrent users with horizontal scaling capabilities.

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│   NestJS     │─────▶│  PostgreSQL │
│  Frontend   │      │   Backend    │      │  + Prisma   │
│ (React 19)  │      │  (Monolith)  │      └─────────────┘
└─────────────┘      └──────────────┘              │
       │                     │                      │
       │              ┌──────┴────────┐      ┌─────▼─────┐
       │              │               │      │   Redis   │
       └─────────────▶│  Socket.io    │◀────▶│  Cache &  │
         WebSocket    │  Real-time    │      │  Pub/Sub  │
                      └───────────────┘      └───────────┘
                              │
                      ┌───────▼────────┐
                      │   S3 Storage   │
                      │  (MinIO/AWS)   │
                      └────────────────┘
```

### Key Features

- ✅ **Authentication**: JWT + OAuth (Google, GitHub, 42)
- ✅ **Real-time Chat**: Socket.io with Redis pub/sub
- ✅ **Room Management**: Create, join, and manage trip rooms
- ✅ **Trip Planning**: Proposals, voting, activities
- ✅ **File Upload**: Profile pictures, room images, attachments
- ✅ **Horizontal Scaling**: Multiple backend instances with Redis
- ✅ **Kubernetes Ready**: Production-grade K8s manifests with HPA
- ✅ **TypeScript**: End-to-end type safety

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + React 19 | Server components, App Router |
| **UI** | shadcn/ui + Tailwind CSS | Modern, accessible components |
| **Backend** | NestJS | Modular TypeScript framework |
| **Database** | PostgreSQL + Prisma 7 | Relational data with type-safe ORM |
| **Cache** | Redis | Session store, pub/sub, rate limiting |
| **Real-time** | Socket.io | WebSocket connections |
| **Storage** | S3-compatible (MinIO/AWS S3) | File uploads |
| **Deployment** | Docker + Kubernetes | Containerization & orchestration |
| **Package Manager** | pnpm | Fast, efficient monorepo support |

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (LTS)
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL, Redis, MinIO (via Docker)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd travel-planner

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure (PostgreSQL, Redis, MinIO)
docker-compose -f docker-compose.dev.yml up -d

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed

# Start development servers (backend + frontend)
pnpm dev
```

### Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **WebSocket**: ws://localhost:4000
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## 📂 Project Structure

```
travel-planner/
├── apps/
│   ├── backend/                 # NestJS backend
│   │   └── src/
│   │       ├── modules/         # Feature modules
│   │       │   ├── auth/        # Authentication (JWT + OAuth)
│   │       │   ├── users/       # User management
│   │       │   ├── rooms/       # Trip rooms
│   │       │   ├── chat/        # Real-time chat
│   │       │   ├── notifications/
│   │       │   └── storage/     # File uploads
│   │       ├── common/          # Shared utilities
│   │       │   ├── decorators/
│   │       │   ├── guards/
│   │       │   ├── prisma/
│   │       │   └── redis/
│   │       └── main.ts
│   │
│   └── web/                     # Next.js frontend (TODO)
│       ├── src/
│       │   ├── app/             # App router pages
│       │   ├── components/      # React components
│       │   ├── lib/             # Utilities & API client
│       │   └── hooks/           # Custom hooks
│       └── package.json
│
├── packages/
│   ├── shared/                  # Shared types & constants
│   │   └── src/
│   │       ├── types/           # TypeScript interfaces
│   │       └── constants/       # API routes, events
│   │
│   └── database/                # Prisma schema & migrations
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── index.ts
│
├── docker/                      # Dockerfiles
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── postgres.yaml
│   ├── redis.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   └── ingress.yaml
│
├── docker-compose.yml           # Production compose
├── docker-compose.dev.yml       # Development compose
├── pnpm-workspace.yaml          # Monorepo config
└── package.json                 # Root package.json
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                # Start all services
pnpm dev:backend        # Start backend only
pnpm dev:web            # Start frontend only

# Database
pnpm db:generate        # Generate Prisma client
pnpm db:migrate         # Run migrations
pnpm db:push            # Push schema changes
pnpm db:seed            # Seed database
pnpm db:studio          # Open Prisma Studio

# Build
pnpm build              # Build all packages
pnpm build:backend      # Build backend
pnpm build:web          # Build frontend

# Testing
pnpm test               # Run tests
pnpm lint               # Lint code
pnpm format             # Format code with Prettier

# Cleanup
pnpm clean              # Remove node_modules & build artifacts
```

### Setting Up OAuth

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
6. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

#### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:4000/api/auth/github/callback`
4. Update `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

#### 42 OAuth

1. Go to [42 Intra](https://profile.intra.42.fr/oauth/applications/new)
2. Create new application
3. Redirect URI: `http://localhost:4000/api/auth/42/callback`
4. Update `.env`:
   ```env
   FORTY_TWO_CLIENT_ID=your_uid
   FORTY_TWO_CLIENT_SECRET=your_secret
   ```

## 🐳 Docker Deployment

### Development

```bash
# Start infrastructure only
docker-compose -f docker-compose.dev.yml up -d

# Stop infrastructure
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

See [k8s/README.md](k8s/README.md) for detailed Kubernetes deployment guide.

```bash
# Quick deploy
kubectl apply -k k8s/

# Check status
kubectl get pods -n travel-planner

# View logs
kubectl logs -n travel-planner -l app=backend -f
```

### Production Checklist

- [ ] Update secrets in `k8s/secrets.yaml`
- [ ] Update domain in `k8s/ingress.yaml`
- [ ] Configure cert-manager for TLS
- [ ] Set up managed PostgreSQL (AWS RDS, GCP Cloud SQL)
- [ ] Set up managed Redis (AWS ElastiCache, GCP Memorystore)
- [ ] Configure S3 or equivalent object storage
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure logging (ELK or cloud logging)
- [ ] Set up CI/CD pipeline
- [ ] Configure automated backups

## 🔐 Security

- JWT tokens stored in HTTP-only cookies
- CORS configured with specific origins
- Rate limiting via Throttler
- Input validation with class-validator
- SQL injection protection via Prisma
- Password hashing with bcrypt (10 rounds)
- OAuth for third-party authentication

## 📊 Scaling

### Horizontal Scaling

The architecture supports horizontal scaling out of the box:

1. **Backend**: Scale to multiple instances (K8s HPA: 3-10 pods)
2. **Frontend**: Scale based on traffic (K8s HPA: 2-5 pods)
3. **Redis Pub/Sub**: Coordinates real-time events across backend instances
4. **Database**: Use read replicas for read-heavy operations

### Performance Optimization

- Redis caching for frequently accessed data
- Database indexes on commonly queried fields
- Connection pooling via Prisma
- Lazy loading and code splitting in Next.js
- CDN for static assets
- WebSocket connection pooling

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📝 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get current user
GET    /api/auth/google            # OAuth with Google
GET    /api/auth/github            # OAuth with GitHub
GET    /api/auth/42                # OAuth with 42
```

### Room Endpoints

```
POST   /api/rooms                  # Create room
GET    /api/rooms/:id              # Get room details
POST   /api/rooms/:id/join         # Join room
POST   /api/rooms/:id/leave        # Leave room
POST   /api/rooms/:id/proposals    # Create trip proposal
POST   /api/rooms/:roomId/proposals/:proposalId/vote  # Vote on proposal
```

See [packages/shared/src/constants/index.ts](packages/shared/src/constants/index.ts) for complete API routes.

## 🔌 WebSocket Events

```typescript
// Chat
'message:send'     # Send message
'message:receive'  # Receive message
'typing:start'     # User started typing
'typing:stop'      # User stopped typing

// Room
'room:join'        # Join room
'room:leave'       # Leave room

// Presence
'user:online'      # User came online
'user:offline'     # User went offline
```

## 🤝 Contributing

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/your-feature
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with modern best practices
- Inspired by production-grade architectures
- Ready for 1000s of concurrent users

---

**Built with ❤️ for collaborative travel planning**
