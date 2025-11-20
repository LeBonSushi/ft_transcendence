#!/bin/bash

# TRANSv2 Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Starting TRANSv2 Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker compose.prod.yml"

echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"

# Confirmation prompt
echo -e "${YELLOW}⚠️  This will deploy to $ENVIRONMENT environment. Continue? (y/n)${NC}"
read -r confirmation

if [ "$confirmation" != "y" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 0
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Please create it from .env.example${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# Pull latest code (if using git)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pulling latest code...${NC}"
    git pull origin main
    echo -e "${GREEN}✅ Code updated${NC}"
fi

# Backup current state
echo -e "${YELLOW}💾 Creating backup...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
docker compose -f $COMPOSE_FILE ps -q | xargs -I {} docker inspect {} > "$BACKUP_DIR/containers.json" 2>/dev/null || true
echo -e "${GREEN}✅ Backup created at $BACKUP_DIR${NC}"

# Stop running containers
echo -e "${YELLOW}🛑 Stopping current services...${NC}"
docker compose -f $COMPOSE_FILE down

# Remove old images and cache
echo -e "${YELLOW}🧹 Cleaning Docker cache and old images...${NC}"
docker builder prune -f
docker image prune -f
echo -e "${GREEN}✅ Cache cleaned${NC}"

# Build new images
echo -e "${YELLOW}🔨 Building new images (no cache)...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache

echo -e "${GREEN}✅ Images built successfully${NC}"

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check service health
echo -e "${YELLOW}🏥 Checking service health...${NC}"
UNHEALTHY_SERVICES=$(docker compose -f $COMPOSE_FILE ps | grep -i "unhealthy" || true)

if [ -n "$UNHEALTHY_SERVICES" ]; then
    echo -e "${RED}❌ Some services are unhealthy:${NC}"
    echo "$UNHEALTHY_SERVICES"
    echo -e "${YELLOW}Check logs with: docker compose -f $COMPOSE_FILE logs${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All services are healthy${NC}"

# Show running services
echo -e "${YELLOW}📊 Running services:${NC}"
docker compose -f $COMPOSE_FILE ps

# Show logs
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker compose -f $COMPOSE_FILE logs --tail=50

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📌 Useful commands:${NC}"
echo "- View logs: docker compose -f $COMPOSE_FILE logs -f [service]"
echo "- Restart service: docker compose -f $COMPOSE_FILE restart [service]"
echo "- Stop all: docker compose -f $COMPOSE_FILE down"
echo "- Scale service: docker compose -f $COMPOSE_FILE up -d --scale [service]=3"
echo ""
