.PHONY: dev prod stop clean logs db-seed db-reset db-migrate db-studio

# ============ DEV ============
# Lance l'infra (postgres, redis, minio) + init + app en local
dev:
	@echo "Starting dev infrastructure..."
	docker compose -f docker-compose.dev.yml up -d
	@echo "Waiting for services to be healthy..."
	@until docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@until docker compose -f docker-compose.dev.yml exec -T redis redis-cli ping > /dev/null 2>&1; do sleep 1; done
	@until curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; do sleep 1; done
	@echo "Creating MinIO bucket (if not exists)..."
	@docker compose -f docker-compose.dev.yml exec -T minio mc alias set local http://localhost:9000 minioadmin minioadmin > /dev/null 2>&1
	@docker compose -f docker-compose.dev.yml exec -T minio mc mb --ignore-existing local/travel-planner
	@echo "Generating Prisma client..."
	pnpm db:generate
	@echo "Running migrations..."
	pnpm db:migrate
	@echo "Starting dev servers..."
	pnpm dev

# ============ PROD ============
# Lance tout via docker-compose (build + run)
prod:
	@echo "Building and starting production..."
	docker compose up -d --build
	@echo "Waiting for services to be healthy..."
	@until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@until docker compose exec -T redis redis-cli ping > /dev/null 2>&1; do sleep 1; done
	@until docker compose exec -T minio curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; do sleep 1; done
	@echo "Creating MinIO bucket (if not exists)..."
	@docker compose exec -T minio mc alias set local http://localhost:9000 minioadmin minioadmin > /dev/null 2>&1
	@docker compose exec -T minio mc mb --ignore-existing local/travel-planner
	@echo "Running migrations..."
	docker compose exec -T backend npx prisma migrate deploy --schema=./packages/database/prisma/schema.prisma
	@echo "Production is up!"

# ============ UTILITIES ============
stop:
	docker compose -f docker-compose.dev.yml down
	docker compose down

clean:
	docker compose -f docker-compose.dev.yml down -v
	docker compose down -v
	@echo "Volumes removed."

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-prod:
	docker compose logs -f

db-seed:
	pnpm db:seed

db-reset:
	pnpm db:reset

db-migrate:
	pnpm db:migrate

db-studio:
	pnpm db:studio
