*This project has been created as part of the 42 curriculum by [ggirault](https://github.com/AkAzA509), [macorso](https://github.com/LeBonSushi), [nbrecque](https://github.com/Brecqueville), [njard](https://github.com/noanjrd).*

# Project Overview

The direction of our transcendence was to make it a group travel planning site (friends, family, work, etc.)
For this, we imagined our site as a messaging platform centralizing several tools that are usually separate:
 - availability management
 - destination proposal
 - voting/polling
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
make
```

# Useful Resources

Here is a list of all the resources that helped us build our app

  * Database:
	- Use Prisma in NextJS [here](https://codelynx.dev/posts/guide-prisma)
	- Official Prisma docs [here](https://www.prisma.io/docs/getting-started/prisma-postgres/quickstart/prisma-orm)

  * Framework/languages:
	- Official NestJs docs [here](https://docs.nestjs.com/)
	- Official NextJs docs [here](https://nextjs.org/docs)
	- Official React docs [here](https://fr.react.dev/reference/react-dom/components)
	- Official Tailwind docs [here](https://tailwindcss.com/docs/installation/using-vite)
	- Official NextAuth docs [here](https://next-auth.js.org/)
	- OpenClassroom Js tutorial [here](https://openclassrooms.com/fr/courses/6390246-passez-au-full-stack-avec-node-js-express-et-mongodb)

  * WebSocket/Chat:
	- Official Socket.io docs [here](https://socket.io/docs/v4/)
	- NestJS WebSockets/Gateways docs [here](https://docs.nestjs.com/websockets/gateways)

  * 2FA:
	- otplib (TOTP library) [here](https://github.com/yeojz/otplib)

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

### nbrecque [[ dev ](#developer)]:
- Backend chat
- WebSocket
- 2FA

### njard [[ pm ](#project-manager-pm)][[ dev ](#developer)] :
- Task organization and project management
- Developed the notification system and integrated it across all modules
- Frontend implementation for notifications (UI/UX)

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
[![TS](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=222&style=for-the-badge)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js + React | Server components, App Router |
| **UI** | shadcn/ui + Tailwind CSS | Modern, accessible components |
| **Backend** | NestJS + NextAuth | Modular TypeScript framework and auth provider|
| **Database** | PostgreSQL + Prisma | Relational data with type-safe ORM |
| **Cache** | Redis | Session store, caching|
| **Real-time** | Socket.io | WebSocket connections |
| **Deployment** | Docker / Docker compose | Containerization & orchestration |
| **Package Manager** | pnpm | Fast, efficient, lightweight|
| **Storage** | S3-compatible MinIO | File uploads |

## Database scheme

![Database schema preview](./prisma-erd.svg)

# Features List

Here is a list of features and the people who worked on them

* Chat (Nbrecque):
    <p>Real-time messaging system via WebSocket (Socket.io). Features include room creation and management, instant communication between clients, and persistent message history. Supports private and group discussions with a dedicated backend service and controller.</p>

* Notifications (Njard):
    <p>Developed a centralized notification engine interconnected with all platform modules (Rooms, Friends, Auth). This system acts as a hub to deliver real-time user alerts via WebSockets. Implemented the complete backend logic (services & gateways) and the frontend notification center to ensure seamless event-driven feedback across the entire application.</p>

* Rooms (Njard / Nbrecque / Ggirault / Macorso):
	<p>Discussion room by group message or dm, a room is a discussion room with an admin who has the rights to this room (kick, invitation, delete), the room has functionalities for adding activity, proposing information date and date matching to find the optimal date, dm are a type of room with only the possibility of sending messages</p>

* Profile (Macorso / Ggirault):
	<p>Porfile page, summary of profile information, modification of the theme system, activation of 2FA, deletion of the account and modification of fields (last name, first name, password, email, username)</p>

* 2-factor authentication (Nbrecque)
	<p>2FA activation/deactivation from profile settings. Scannable QR code generation with Google Authenticator. TOTP verification at login with intermediate screen. 8 single-use backup codes in case of phone loss.</p>

# Chosen modules

| Module                                | Type   | Points | Members  | Justification | Implementation |
|----------------------------------------|--------|--------|------------------------|----------------------------------------------------------------------|------------------------------------------------|
| Realtime feature (WebSocket)           | Major  |   2    | Njard, Nbrecque        | Enables instant notifications and messaging for real-time UX         | Used socket.io, managed events and templates   |
| Frameworks (NestJS, Next.js)           | Major  |   2    | All team               | Robust, scalable, productive fullstack foundation                    | Main project architecture and dev              |
| Users interactions                     | Major  |   2    | All team               | Social features (friends, chat, blocking) are core to the app        | Add/remove/block friends, private/group chat   |
| User authentication and management     | Major  |   2    | Macorso, Ggirault      | Security and user management for persistence and compliance          | Next auth, GDPR management, admin interface    |
| ORM (Prisma)                           | Minor  |   1    | Macorso, Ggirault      | Simplifies and secures database access                               | Schema modeling, type-safe queries             |
| Notifications system                   | Minor  |   1    | Njard                  | Completes the user interaction experience                            | Real-time notification system                  |
| OAuth 2.0                              | Minor  |   1    | Macorso                | Simplifies login via external providers                              | Next OAuth integration                         |
| 2FA                                    | Minor  |   1    | Macorso                | Enhances account security                                            | 2FA via Next                                   |
| Custom design (min 10 components)      | Minor  |   1    | All team               | Improves user experience and visual identity                         | Reusable UI components (shadcn/ui, Tailwind)   |
| Advanced chat features                 | Minor  |   1    | All team               | Improves user experience with richer chat                            | Support for images, audio, user blocking       |
| GDPR compliance                        | Minor  |   1    | Ggirault, Macorso      | Legal compliance and data security                                   | Terms page, GDPR management in profile         |
| Additionnal browser					 | Minor  |   1    |     					| work on different browser 										   | no specific implementation						|
| **TOTAL**                              |        | **16** 

# Individual Contributions

Below is a summary of the main project areas and contributions.

## Project Architecture (Ggirault, Macorso)
- Led the initial design and technical decisions for the project architecture.
- Organized service structure, Dockerization, and overall infrastructure.
- Migrated from the old subject constraints to a more flexible architecture after the new requirements were announced.
- Switched from npm to pnpm for efficiency, and reused existing code where possible.
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

## WebSocket (Njard / Nbrecque)
- **Real-time Infrastructure**: Implementation of a robust architecture based on Socket.io and NestJS Gateways to ensure seamless bidirectional communication between the server and clients.
- **Redis Synchronization**: Integration of Redis Pub/Sub as a shared communication bus to ensure scalability. This layer allows message and notification distribution across multiple server instances, ensuring consistency regardless of which instance a user is connected to.

## 2FA - Two Factor Authentication (Nbrecque)
- TOTP 2FA implementation with the otplib library on the backend
- Created the service (two-factor.services.ts) and controller (two-factor.controller.ts) with 4 JWT-protected API routes
- Modified the login flow in auth.service.ts to handle the intermediate "2FA required" state
- Frontend: OTP screen at login, activation/deactivation UI in settings, QR code