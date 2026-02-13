*This project has been created as part of the 42 curriculum by [ggriault](https://github.com/AkAzA509), [macorso](https://github.com/LeBonSushi), [nbrecque](https://github.com/Brecqueville), [njard](https://github.com/noanjrd).*

# Project Overview

The direction of our transcendence was to make it a group travel planning site (friends, family, work, etc.)
For this, we imagined our site as a messaging platform centralizing several tools that are usually separate:
 - availability management
 - voting/polling
 - (optional) budgeting
 - group messaging
 - private messaging

# Installation

To use our WebApp, simply follow these steps
```bash
#prerequisites
pnpm v10.28+
docker v29.1+
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

# Useful Resources

Here is a list of all the resources that helped us build our app

  * Database:
	- Use Prisma in NextJS [here](https://codelynx.dev/posts/guide-prisma)
	- Official Prisma docs [here](https://www.prisma.io/docs/getting-started/prisma-postgres/quickstart/prisma-orm)
	- etc

  * Framework/languages:
	- Official NestJs docs [here](https://docs.nestjs.com/)
	- Official NextJs docs [here](https://nextjs.org/docs)
	- Official React docs [here](https://fr.react.dev/reference/react-dom/components)
	- Official Tailwind docs [here](https://tailwindcss.com/docs/installation/using-vite)
	- Official NextAuth docs [here](https://next-auth.js.org/)
	- OpenClassroom Js tutorial [here](https://openclassrooms.com/fr/courses/6390246-passez-au-full-stack-avec-node-js-express-et-mongodb)
	- etc

  * API:
	- Sort of API youtube video [here](https://www.youtube.com/watch?v=pBASqUbZgkY)

Use of AI in our project:
 - help with infrastructure design to confirm our choices
 - help with designing relationships between tables in the db
 - explanation/help when having difficulty fixing code
 - help understanding new concepts in addition to the docs

# Team information

## Roles

### <a name="po"></a>Product Owner (PO)
Makes decisions on features and priorities. Validates completed work. Communicates with stakeholders.

### <a name="pm"></a>Project Manager (PM)
Organizes team meetings and planning sessions. Tracks progress and deadlines. Ensures team communication. Manages risks and blockers

### <a name="techld"></a>Tech Lead
Defines technical architecture. Makes technology stack decisions. Ensures code quality and best practices

### <a name="dev"></a>Developer
Write code for assigned features. Participate in code reviews. Test their implementations. Document their work.

### ggirault [[ po ](#product-owner-po)][[ dev ](#developer)]:
- All the little annoying things
- Backend users
- Archi design with macorso
- DB design
- front

### macorso [[ tech lead ](#tech-lead)][[ dev ](#developer)]:
- api
- auth
- choice of language/framework
- front
- 

### nbrecque [[ dev ](#developer)]:
- Backend chat
- WebSocket
- front
-
-

### njard [[ pm ](#project-manager-pm)][[ dev ](#developer)] :
- organization setup
- Backend notification
- front
-
-

## Project Management

Teamwork was organized in a structured way to ensure good project progress tracking.

- **Work organization**
  Tasks were distributed among team members and tracked via a shared **Google Docs** document, allowing everyone to see each other's progress.
  Individual meetings were organized **once a week** with each member to review task status and anticipate potential blockers.

- **Project management tools**
  - **Google Docs**: task organization and progress tracking
  - **GitHub**: code sharing, version control, and collaboration

- **Communication channels**
  - **WhatsApp**: fast communication and daily coordination between team members

# Technical Stack

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white&style=for-the-badge)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white&style=for-the-badge)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white&style=for-the-badge)](https://www.prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth-000000?logo=nextdotjs&logoColor=white&style=for-the-badge)](https://next-auth.js.org/)
[![Pnpm](https://img.shields.io/badge/Pnpm-222?logo=pnpm&logoColor=F69220&style=for-the-badge)](https://pnpm.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white&style=for-the-badge)](https://kubernetes.io/)
[![TS](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=222&style=for-the-badge)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![ngrok](https://img.shields.io/badge/ngrok-1F1F1F?logo=ngrok&logoColor=white&style=for-the-badge)](https://ngrok.com/)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js + React | Server components, App Router |
| **UI** | shadcn/ui + Tailwind CSS | Modern, accessible components |
| **Backend** | NestJS + NextAuth | Modular TypeScript framework and auth provider|
| **Database** | PostgreSQL + Prisma | Relational data with type-safe ORM |
| **Cache** | Redis | Session store, caching|
| **Real-time** | Socket.io | WebSocket connections |
| **Deployment** | Docker + Kubernetes | Containerization & orchestration |
| **Package Manager** | pnpm | Fast, efficient, lightweight|
<!-- | **Storage** | S3-compatible (MinIO/AWS S3) | File uploads | -->

## Database scheme

![Database schema preview](./prisma-erd.svg)

# Features List

Here is a list of features and the people who worked on them

* Chat/Notifications (Njard / Nbrecque):
	<p>to be completed</p>

* Rooms (Njard / Nbrecque / Ggirault / Macorso):
	<p>to be completed</p>

* Profile (Macorso / Ggirault):
	<p>to be completed</p>

* 2-factor authentication (Macorso)
	<p>to be completed</p>

# Chosen modules

| Module                                | Type   | Points | Members  | Justification | Implementation |
|----------------------------------------|--------|--------|------------------------|----------------------------------------------------------------------|------------------------------------------------|
| Realtime feature (WebSocket)           | Major  |   2    | Njard, Nbrecque        | Enables instant notifications and messaging for real-time UX         | Used socket.io, managed events and templates   |
| Frameworks (NestJS, Next.js)           | Major  |   2    | All team               | Robust, scalable, productive fullstack foundation                    | Main project architecture and dev              |
| Users interactions                     | Major  |   2    | All team               | Social features (friends, chat, blocking) are core to the app        | Add/remove/block friends, private/group chat   |
| User authentication and management     | Major  |   2    | Macorso, Ggirault      | Security and user management for persistence and compliance          | Next auth, GDPR management, admin interface   |
| Public API                             | Major  |   2    | Macorso                | Allows external integrations and extensibility                       | Secure REST endpoints, documentation           |
| ORM (Prisma)                           | Minor  |   1    | Macorso, Ggirault      | Simplifies and secures database access                               | Schema modeling, type-safe queries             |
| Notifications system                   | Minor  |   1    | Njard                  | Completes the user interaction experience                            | Real-time notification system                  |
| OAuth 2.0                              | Minor  |   1    | Macorso                | Simplifies login via external providers                              | Next OAuth integration                        |
| 2FA                                    | Minor  |   1    | Macorso                | Enhances account security                                            | 2FA via Next                                  |
| Custom design (min 10 components)      | Minor  |   1    | All team               | Improves user experience and visual identity                         | Reusable UI components (shadcn/ui, Tailwind)   |
| Advanced chat features                 | Minor  |   1    | All team               | Improves user experience with richer chat                            | Support for images, audio, user blocking       |
| GDPR compliance                        | Minor  |   1    | Ggirault, Macorso      | Legal compliance and data security                                   | Terms page, GDPR management in profile         |
| **TOTAL**                              |        | **17** 

# Individual Contributions

Below is a summary of the main project areas and contributions.

## Project Architecture (Ggirault, Macorso)
- Led the initial design and technical decisions for the project architecture.
- Organized service structure, Dockerization, and overall infrastructure.
- Migrated from the old subject constraints to a more flexible architecture after the new requirements were announced.
- Switched from npm to pnpm for efficiency, introduced Kubernetes for scalability, and reused existing code where possible.
- Faced challenges adapting to new technologies and requirements, but overcame them through research and team collaboration.

## Backend Services (All team)
- Early backend development was handled by the first two members, then distributed among the full team as more joined.
- Each member took responsibility for different backend services [see module table above](#chosen-modules).
- Initial difficulties with branch merging and coordination were resolved through improved communication and workflow adjustments.

## Frontend (All team)
- Frontend tasks were divided so everyone could work on the parts related to their backend features.
- Example: Njard developed the notification backend and also implemented the notification UI and components.
- Early challenges in maintaining a consistent UI were solved by adopting a global stylesheet and frequent team discussions.

## Database (All team)
- Ggirault created the original schema with all [the tables](#database-scheme) and relations and did the first migrations.
- Then each member added/modified the schema to match our new features or needs.
- We had some implementation issues at the beginning, struggling to use it properly, and also some problems during schema migrations or seeding for tests.

## WebSocket
- to be completed

## Other Features
- to be completed