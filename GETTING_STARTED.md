# Getting Started Guide

Welcome to the Travel Planner project! This guide will help you get the application running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22+ (LTS) - [Download](https://nodejs.org/)
- **pnpm** 9+ - Install with: `npm install -g pnpm`
- **Docker** & **Docker Compose** - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd travel-planner
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo.

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

The default `.env` file is configured for local development and should work out of the box.

### 4. Start Infrastructure

Start PostgreSQL, Redis, and MinIO:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Verify containers are running:

```bash
docker ps
```

You should see 3 containers running:
- `travel-planner-postgres-dev`
- `travel-planner-redis-dev`
- `travel-planner-minio-dev`

### 5. Set Up Database

```bash
# Generate Prisma client (Prisma 7 - important!)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed
```

> **Note Prisma 7**: Si vous voyez une erreur TypeScript sur `PrismaClient`, c'est normal avant `pnpm db:generate`. Elle disparaîtra après la génération du client.

### 6. Start Development Servers

```bash
# Start both backend and frontend
pnpm dev
```

Or start them separately:

```bash
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend
pnpm dev:web
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Prisma Studio**: `pnpm db:studio`
- **MinIO Console**: http://localhost:9001

## Test Accounts

After seeding, you can log in with:

```
Email: alice@example.com
Password: password123

Email: bob@example.com
Password: password123

Email: charlie@example.com
Password: password123
```

## Project Structure

```
travel-planner/
├── apps/
│   ├── backend/       # NestJS backend
│   └── web/           # Next.js frontend
├── packages/
│   ├── shared/        # Shared types
│   └── database/      # Prisma schema
└── docker/            # Docker configs
```

## Common Commands

```bash
# Development
pnpm dev              # Start all services
pnpm dev:backend      # Start backend only
pnpm dev:web          # Start frontend only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio

# Build
pnpm build            # Build all packages

# Testing
pnpm test             # Run tests
pnpm lint             # Lint code

# Cleanup
pnpm clean            # Remove node_modules
```

## Setting Up OAuth (Optional)

To enable OAuth login:

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:4000/api/auth/google/callback`
4. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Callback URL: `http://localhost:4000/api/auth/github/callback`
4. Update `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### 42 OAuth

1. Go to [42 Intra](https://profile.intra.42.fr/oauth/applications/new)
2. Create new application
3. Redirect URI: `http://localhost:4000/api/auth/42/callback`
4. Update `.env`:
   ```env
   FORTY_TWO_CLIENT_ID=your_uid
   FORTY_TWO_CLIENT_SECRET=your_secret
   ```

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
pnpm db:reset

# Regenerate Prisma client
pnpm db:generate
```

### Frontend Not Loading

```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Reinstall dependencies
pnpm install

# Restart dev server
pnpm dev:web
```

## Next Steps

1. **Explore the Codebase**:
   - Backend modules in `apps/backend/src/modules/`
   - Frontend pages in `apps/web/src/app/`
   - Shared types in `packages/shared/src/types/`

2. **Read Documentation**:
   - [README.md](README.md) - Main documentation
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture comparison
   - [k8s/README.md](k8s/README.md) - Kubernetes deployment

3. **Start Building**:
   - Add new features
   - Customize the UI
   - Deploy to production

## Need Help?

- Check the main [README.md](README.md)
- Review the [ARCHITECTURE.md](ARCHITECTURE.md)
- Open an issue on GitHub

Happy coding! 🚀
