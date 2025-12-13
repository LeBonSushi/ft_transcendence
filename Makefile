.PHONY: help dev dev-build dev-down prod prod-build prod-down logs logs-api logs-auth logs-user logs-chat logs-game logs-front ps restart clean test install

# Variables
DC := docker compose
DC_DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml

help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Démarrer en mode développement (hot reload)
	$(DC_DEV) up -d

dev-build: ## Build et démarrer en mode dev
	$(DC_DEV) up --build

dev-down: ## Arrêter le mode dev
	$(DC_DEV) down

dev-d: ## Démarrer en mode dev détaché (background)
	$(DC_DEV) up -d

# Production
prod: ## Démarrer en mode production
	$(DC) up

prod-build: ## Build et démarrer en mode prod
	$(DC) up --build

prod-down: ## Arrêter le mode prod
	$(DC) down

prod-d: ## Démarrer en mode prod détaché
	$(DC) up -d

# Logs
logs: ## Voir tous les logs (follow)
	$(DC_DEV) logs -f

logs-api: ## Logs de l'API Gateway
	$(DC_DEV) logs -f api-gateway

logs-auth: ## Logs du service auth
	$(DC_DEV) logs -f service-auth

logs-user: ## Logs du service user
	$(DC_DEV) logs -f service-user

logs-chat: ## Logs du service chat
	$(DC_DEV) logs -f service-chat

logs-game: ## Logs du service game
	$(DC_DEV) logs -f service-game

logs-front: ## Logs du frontend
	$(DC_DEV) logs -f frontend

# Utilities
ps: ## Voir l'état des containers
	$(DC_DEV) ps

restart: ## Redémarrer tous les services
	$(DC_DEV) restart

restart-api: ## Redémarrer l'API Gateway
	$(DC_DEV) restart api-gateway

restart-auth: ## Redémarrer le service auth
	$(DC_DEV) restart service-auth

restart-user: ## Redémarrer le service user
	$(DC_DEV) restart service-user

restart-chat: ## Redémarrer le service chat
	$(DC_DEV) restart service-chat

restart-game: ## Redémarrer le service game
	$(DC_DEV) restart service-game

restart-front: ## Redémarrer le frontend
	$(DC_DEV) restart frontend

clean: ## Nettoyer containers, volumes et images
	$(DC_DEV) down -v --remove-orphans
	docker system prune -f

clean-all: ## Nettoyer tout (y compris images)
	$(DC_DEV) down -v --remove-orphans --rmi all
	docker system prune -af

# Tests
test: ## Lancer les tests (via npm)
	npm test

test-auth: ## Tests service auth
	cd backend/service-auth && npm test

test-user: ## Tests service user
	cd backend/service-user && npm test

# Installation
install: ## Installer les dépendances (root et workspaces)
	npm install

# Prisma (base de données PostgreSQL centralisée)
prisma-generate: ## Générer le client Prisma
	@echo "Génération du client Prisma..."
	cd database && npx prisma generate
	@echo "✅ Client Prisma généré"

prisma-migrate: ## Créer et appliquer une migration
	@echo "Application de la migration Prisma..."
	cd database && npx prisma migrate dev

prisma-migrate-deploy: ## Appliquer les migrations en prod (sans prompt)
	@echo "Déploiement des migrations..."
	cd database && npx prisma migrate deploy

prisma-push: ## Push le schema vers la DB (sans migration)
	@echo "Push du schema Prisma..."
	cd database && npx prisma db push

prisma-studio: ## Ouvrir Prisma Studio pour voir les données
	cd database && npx prisma studio

prisma-reset: ## Reset la base de données (DANGER!)
	@echo "⚠️  RESET de la base de données..."
	cd database && npx prisma migrate reset --force

# PostgreSQL
postgres-shell: ## Se connecter au shell PostgreSQL
	$(DC_DEV) exec postgres psql -U trans -d trans

postgres-logs: ## Voir les logs PostgreSQL
	$(DC_DEV) logs -f postgres

# API Testing
test-login: ## Tester POST /auth/login
	@curl -X POST http://localhost:8080/auth/login \
		-H 'Content-Type: application/json' \
		-d '{"username":"test","password":"test"}' | jq

test-register: ## Tester POST /auth/register
	@curl -X POST http://localhost:8080/auth/register \
		-H 'Content-Type: application/json' \
		-d '{"email":"test@example.com","password":"test123"}' | jq

# Rebuild specific service
rebuild-api: ## Rebuild uniquement l'API Gateway
	$(DC_DEV) up -d --build api-gateway

rebuild-auth: ## Rebuild uniquement le service auth
	$(DC_DEV) up -d --build service-auth

rebuild-front: ## Rebuild uniquement le frontend
	$(DC_DEV) up -d --build frontend
