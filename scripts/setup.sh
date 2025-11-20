#!/bin/bash

# TRANSv2 Setup Script
# This script sets up the development environment

set -e

echo "🚀 Starting TRANSv2 Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Create .env files from examples if they don't exist
echo -e "${YELLOW}📝 Setting up environment files...${NC}"

# Root .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created root .env file${NC}"
else
    echo -e "${YELLOW}⚠️  Root .env file already exists${NC}"
fi

# Backend services .env files
for service in service-auth service-chat service-game service-user; do
    if [ ! -f "backend/$service/.env" ]; then
        cp "backend/$service/.env.example" "backend/$service/.env"
        echo -e "${GREEN}✅ Created backend/$service/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  backend/$service/.env already exists${NC}"
    fi
done

# Frontend .env
if [ ! -f "frontend/web-app/.env" ]; then
    cp "frontend/web-app/.env.example" "frontend/web-app/.env"
    echo -e "${GREEN}✅ Created frontend/web-app/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/web-app/.env already exists${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p nginx/ssl
mkdir -p logs

echo -e "${GREEN}✅ Directories created${NC}"

# Install dependencies for each service (optional, can be done in Docker)
echo -e "${YELLOW}📦 Would you like to install npm dependencies locally? (y/n)${NC}"
read -r install_deps

if [ "$install_deps" = "y" ]; then
    for service in backend/service-auth backend/service-chat backend/service-game backend/service-user; do
        if [ -f "$service/package.json" ]; then
            echo -e "${YELLOW}Installing dependencies for $service...${NC}"
            (cd "$service" && npm install)
            echo -e "${GREEN}✅ Dependencies installed for $service${NC}"
        fi
    done
    
    if [ -f "frontend/web-app/package.json" ]; then
        echo -e "${YELLOW}Installing dependencies for frontend...${NC}"
        (cd frontend/web-app && npm install)
        echo -e "${GREEN}✅ Dependencies installed for frontend${NC}"
    fi
fi

# Build Docker images
echo -e "${YELLOW}🧹 Cleaning Docker cache...${NC}"
docker builder prune -f

echo -e "${YELLOW}🐳 Building Docker images (no cache)...${NC}"
docker compose build --no-cache

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Start the services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d

echo -e "${GREEN}✅ Services started successfully${NC}"

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Show running containers
echo -e "${YELLOW}📊 Running containers:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📌 Next steps:${NC}"
echo "1. Check the logs: docker compose logs -f"
echo "2. Access the application: http://localhost"
echo "3. Stop services: docker compose down"
echo "4. View this help anytime: ./scripts/setup.sh --help"
echo ""
