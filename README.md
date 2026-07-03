# ft_transcendence — Group Travel Planning Platform

Full-stack web application built by a **team of 4** as the final project of the 42 Common Core.

A messaging-first platform that centralizes everything a group (friends, family, coworkers) needs to plan a trip together — tools that are usually spread across separate apps:

- 📅 **Availability management** & date matching to find the optimal date
- 🗺️ **Destination proposals** with voting/polls
- 💬 **Group & private messaging** in real time
- 🔔 **Real-time notifications** across the whole app

## Tech stack

[![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white&style=for-the-badge)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white&style=for-the-badge)](https://nestjs.com/)
[![TS](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white&style=for-the-badge)](https://www.prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)](https://www.docker.com/)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) + React | Server components, SSR |
| **UI** | shadcn/ui + Tailwind CSS | Reusable, accessible components |
| **Backend** | NestJS | Modular TypeScript API |
| **Auth** | NextAuth (OAuth 2.0) + TOTP 2FA | Sessions, external providers, 2FA |
| **Database** | PostgreSQL + Prisma | Type-safe ORM, migrations |
| **Real-time** | Socket.io + Redis Pub/Sub | WebSockets, multi-instance sync |
| **Storage** | MinIO (S3-compatible) | File uploads |
| **Infra** | Docker Compose, Turborepo, pnpm | Monorepo & containerized deployment |

## Key features

- **Real-time chat** — rooms and DMs over WebSocket (Socket.io + NestJS gateways), persistent history, image/audio messages, user blocking
- **Rooms with admin rights** (kick, invite, delete), activity proposals, date proposals and automatic date matching
- **Centralized notification system** — a hub interconnected with all modules (rooms, friends, auth), delivered in real time; Redis Pub/Sub keeps events consistent across multiple server instances
- **Authentication** — OAuth 2.0 login via external providers, route-protection middleware, full session lifecycle with NextAuth
- **Two-factor authentication** — TOTP (Google Authenticator), QR-code enrollment, intermediate 2FA screen at login, 8 single-use backup codes
- **Profile & GDPR** — profile editing, theming, 2FA management, account deletion, terms & data management

## Architecture

- **Turborepo + pnpm monorepo**: `apps/` (frontend, API) and `packages/` (shared code)
- **Dockerized** end to end, with separate dev (`docker-compose.dev.yml`) and prod (`docker-compose.yml`) setups

### Database schema

![Database schema](./prisma-erd.svg)

## Getting started

Prerequisites: `pnpm` ≥ 10, `docker` ≥ 29.

```bash
git clone git@github.com:LeBonSushi/ft_transcendence.git
cd ft_transcendence
pnpm install
cp .env.example .env   # then fill in your configuration
make                    # build & launch the app
```

## Team

*Built as part of the 42 curriculum by [ggirault](https://github.com/AkAzA509), [macorso](https://github.com/LeBonSushi), [nbrecque](https://github.com/Brecqueville) and [njard](https://github.com/noanjrd).*

| Member | Focus |
|--------|-------|
| **macorso** (tech lead) | Architecture & stack choices, authentication (OAuth, sessions), API, frontend |
| **ggirault** (product owner) | Database design, backend users, architecture, frontend |
| **nbrecque** | Chat backend, WebSocket, 2FA |
| **njard** (project manager) | Notification system (backend + UI), project management |

> AI tools were used as a support (validating architecture choices, debugging help, exploring new concepts) — all code was written, reviewed and understood by the team.
