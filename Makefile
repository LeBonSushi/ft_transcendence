.PHONY: help dev dev-build dev-down prod prod-build prod-down logs logs-api logs-auth logs-user logs-chat logs-game logs-front ps restart clean test install

DC := docker compose
DC_DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml

help:
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Lancer l'environnement de développement avec migration auto
	@echo "🚀 Démarrage de l'environnement de développement..."
	$(DC_DEV) up -d
	@./scripts/db-migrate.sh
	@echo "✨ Environnement prêt!"

dev-build:
	$(DC_DEV) up --build

dev-down:
	$(DC_DEV) down

dev-d:
	$(DC_DEV) up -d

# Production
prod:
	$(DC) up

prod-build:
	$(DC) up --build

prod-down:
	$(DC) down

prod-d:
	$(DC) up -d

logs:
	$(DC_DEV) logs -f

logs-api:
	$(DC_DEV) logs -f api-gateway

logs-auth:
	$(DC_DEV) logs -f service-auth

logs-user:
	$(DC_DEV) logs -f service-user

logs-chat:
	$(DC_DEV) logs -f service-chat

logs-game:
	$(DC_DEV) logs -f service-game

logs-front:
	$(DC_DEV) logs -f frontend

ps:
	$(DC_DEV) ps

restart:
	$(DC_DEV) restart

restart-api:
	$(DC_DEV) restart api-gateway

restart-auth:
	$(DC_DEV) restart service-auth

restart-user:
	$(DC_DEV) restart service-user

restart-chat:
	$(DC_DEV) restart service-chat

restart-game:
	$(DC_DEV) restart service-game

restart-front:
	$(DC_DEV) restart frontend

clean:
	$(DC_DEV) down -v --remove-orphans
	docker system prune -f

clean-all:
	$(DC_DEV) down -v --remove-orphans --rmi all
	docker system prune -af


test:
	npm test

test-auth:
	cd backend/service-auth && npm test

test-user:
	cd backend/service-user && npm test

install:
	npm install

# Prisma (base de données PostgreSQL centralisée)
prisma-init: prisma-generate prisma-migrate prisma-push
	cd database && npm run seed
	@echo "Db initialiser et seeder"

prisma-generate: ## Générer le client Prisma
	@echo "Génération du client Prisma..."
	cd database && npx prisma generate
	@echo "Client Prisma généré"

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
	@echo "RESET de la base de données..."
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
