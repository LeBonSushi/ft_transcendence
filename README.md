*This project has been created as part of the 42 curriculum by [ggriault](https://github.com/AkAzA509), [macorso](https://github.com/LeBonSushi), [nbrecque](hhttps://github.com/Brecqueville), [njard](https://github.com/noanjrd).*

# Project Overview

La direction de notre transcendence a ete d'en faire un site de planifiaction de voyages en groupes (amis, famille, travail ...)
Pour cela nous avons imaginer notre site comme une messagerie centralisant plusieurs outils d'habitude separer:
 - gestion des disponibilites
 - vote/sondage 
 - (optionnal) budgetisation
 - messagerie groupees
 - messagerie privee


# Installation 

Pour utiliser notre WepApp il vous suffit de suivre les etapes suivantes
```bash
#prerequis
pnpm V 10.28+
docker V 29.1+
```

```bash
# Clone the repository
git clone <your-repo-url>
cd travel-planner
```
```bash
# Install dependencies
pnpm install
```

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```
```bash
# Launch the app
pnpm start
```

# Usefull Resources

Ici voici une listes de toute les ressources qui nous on ete a la realisation de notre app

  * Database:
	1. Use Prisma in NextJS [here](https://codelynx.dev/posts/guide-prisma)
	1. Official Prisma docs [here](https://www.prisma.io/docs/getting-started/prisma-postgres/quickstart/prisma-orm)
	1. etc

  * Framwork/languages:
	1. Official NestJs docs [here](https://docs.nestjs.com/)
	1. Official NextJs docs [here](https://nextjs.org/docs)
	1. Official React docs [here](https://fr.react.dev/reference/react-dom/components)
	1. Official Tailwind docs [here](https://tailwindcss.com/docs/installation/using-vite)
	1. Official Clerk docs [here](https://clerk.com/docs/nextjs/getting-started/quickstart)
	1. OpenClassroom Js tuto [here](https://openclassrooms.com/fr/courses/6390246-passez-au-full-stack-avec-node-js-express-et-mongodb)
	1. etc

  * API:
	1. Sort of API youtube video [here](https://www.youtube.com/watch?v=pBASqUbZgkY)

L'utilisation de l'IA dans notre projet:
 - aide au design de l'infrastructure pour etre sur de nos choix
 - aide au design des relation entre les tables dans la db
 - explication/aide lors de difficulter a corriger son code
 - aide a l'aprehension de nouvelle notions en complement des docs


# Team information

## Rôles

### <a name="po"></a>Product Owner (PO)
Makes decisions on features and priorities. Validates completed work. Communicates with stakeholders.

### <a name="pm"></a>Project Manager (PM)
Organizes team meetings and planning sessions. Tracks progress and deadlines. Ensures team communication. Manages risks and blockers

### <a name="techld"></a>Tech Lead
Defines technical architecture. Makes technology stack decisions. Ensures code quality and best practices

### <a name="dev"></a>Développeur
Write code for assigned features. Participate in code reviews. Test their implementations. Document their work.


### ggirault [[ po ](#product-owner-po)][[ dev ](#développeurv)]:
- Tout les petit trucs chiant
- Backend users
- Design archi with macorso
- Design db
- front

### macorso [[ tech lead ](#tech-lead)][[ dev ](#développeurv)]:
- api
- auth
- choix des language/framework
- front
-

### nbrecque [[ dev ](#développeurv)]:
- Backend chat
- WebSocket
- front
-
-

### njard [[ pm ](#project-manager-pm)][[ dev ](#développeurv)] :
- mise en place de l'organisation
- Backend notification
- front
-
-

## Project Management 

je laisse ca a noan

# Technical Stack

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white&style=for-the-badge)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white&style=for-the-badge)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white&style=for-the-badge)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-3B82F6?logo=clerk&logoColor=white&style=for-the-badge)](https://clerk.com/)
[![Pnpm](https://img.shields.io/badge/Pnpm-222?logo=pnpm&logoColor=F69220&style=for-the-badge)](https://pnpm.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white&style=for-the-badge)](https://kubernetes.io/)
[![TS](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=222&style=for-the-badge)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js + React | Server components, App Router |
| **UI** | shadcn/ui + Tailwind CSS | Modern, accessible components |
| **Backend** | NestJS | Modular TypeScript framework |
| **Database** | PostgreSQL + Prisma | Relational data with type-safe ORM |
| **Cache** | Redis | Session store, caching|
| **Real-time** | Socket.io | WebSocket connections |
| **Deployment** | Docker + Kubernetes | Containerization & orchestration |
| **Package Manager** | pnpm | Fast, efficient, ligthweight|
<!-- | **Storage** | S3-compatible (MinIO/AWS S3) | File uploads | -->


![Aperçu du schéma de la base de données](./prisma-erd.svg)
