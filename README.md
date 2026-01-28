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


<p align="center">
  <a href="https://www.prisma.io/" style="text-decoration:none;">
    <img src="https://www.freelogovectors.net/wp-content/uploads/2022/01/prisma_logo-freelogovectors.net_.png"  width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">Prisma</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://react.dev/" style="text-decoration:none;">
    <img src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">React</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://pnpm.io/" style="text-decoration:none;">
    <img src="https://imgs.search.brave.com/wUSyYk6sLy6E8ing99k_jEESXUfjDuhZrf1bxwGXPJI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzYzLzIvcG5wbS1s/b2dvLXBuZ19zZWVr/bG9nby02MzQ1OTcu/cG5n" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">pnpm</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://nextjs.org/" style="text-decoration:none;">
    <img src="https://raw.githubusercontent.com/vercel/vercel/main/packages/frameworks/logos/next.svg" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">Next.js</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://nestjs.com/" style="text-decoration:none;">
    <img src="https://static.cdnlogo.com/logos/n/57/nestjs.svg" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">NestJS</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://tailwindcss.com/" style="text-decoration:none;">
    <img src="https://raw.githubusercontent.com/github/explore/main/topics/tailwind/tailwind.png" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">Tailwind CSS</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://clerk.com/" style="text-decoration:none;">
    <img src="https://avatars.githubusercontent.com/u/49538330?s=200&v=4" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">Clerk</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://www.docker.com/" style="text-decoration:none;">
    <img src="https://www.freelogovectors.net/wp-content/uploads/2023/09/docker_logo-freelogovectors.net_.png" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">Docker</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://kubernetes.io/" style="text-decoration:none;">
    <img src="https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.png" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">Kubernetes</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://developer.mozilla.org/fr/docs/Web/JavaScript" style="text-decoration:none;">
    <img src="https://www.freelogovectors.net/wp-content/uploads/2023/07/js-logo-javascript-sdk-freelogovectors.net_.png" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">JavaScript</span>
  </a>
  &nbsp;&nbsp;
  <a href="https://www.typescriptlang.org/" style="text-decoration:none;">
    <img src="https://www.freelogovectors.net/wp-content/uploads/2021/02/typescript-logo-freelogovectors.net_.png" width="24" height="24" style="vertical-align:middle;"/>
    <span style="vertical-align:middle;">TypeScript</span>
  </a>
</p>


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
