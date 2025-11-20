#!/bin/bash

# TRANSv2 Development Helper Script
# Quick commands for development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo -e "${BLUE}TRANSv2 Development Helper${NC}"
    echo ""
    echo "Usage: ./scripts/dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start         - Start all services"
    echo "  stop          - Stop all services"
    echo "  restart       - Restart all services"
    echo "  logs [svc]    - Show logs (optionally for specific service)"
    echo "  build [svc]   - Rebuild images (optionally specific service)"
    echo "  clean         - Remove all containers, images, and volumes"
    echo "  status        - Show status of all services"
    echo "  shell [svc]   - Open shell in service container"
    echo "  test [svc]    - Run tests for service"
    echo ""
}

case "$1" in
    start)
        echo -e "${GREEN}🚀 Starting services...${NC}"
        docker compose up -d
        docker compose ps
        ;;
    stop)
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        docker compose down
        ;;
    restart)
        echo -e "${YELLOW}🔄 Restarting services...${NC}"
        docker compose restart ${2:-}
        ;;
    logs)
        if [ -z "$2" ]; then
            docker compose logs -f
        else
            docker compose logs -f "$2"
        fi
        ;;
    build)
        echo -e "${YELLOW}🔨 Building images...${NC}"
        if [ -z "$2" ]; then
            docker compose build
        else
            docker compose build "$2"
        fi
        ;;
    clean)
        echo -e "${RED}🧹 Cleaning up...${NC}"
        docker compose down -v
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup complete${NC}"
        ;;
    status)
        echo -e "${BLUE}📊 Service Status:${NC}"
        docker compose ps
        ;;
    shell)
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please specify a service${NC}"
            exit 1
        fi
        docker compose exec "$2" sh
        ;;
    test)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Running all tests...${NC}"
            docker compose exec service-auth npm test
            docker compose exec service-user npm test
            docker compose exec service-chat npm test
            docker compose exec service-game npm test
        else
            docker compose exec "$2" npm test
        fi
        ;;
    *)
        show_help
        ;;
esac
