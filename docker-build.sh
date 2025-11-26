#!/bin/bash

# Docker Build Script for Zypher Chatbot Platform
# Usage: ./docker-build.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found!"
        print_info "Creating .env from env.example..."
        cp env.example .env
        print_info "Please edit .env and set your configuration, especially BETTER_AUTH_SECRET"
        exit 1
    fi
    print_success ".env file found"
}

# Build all images
build_all() {
    print_info "Building all Docker images..."
    docker-compose build --parallel
    print_success "All images built successfully"
}

# Build specific service
build_service() {
    SERVICE=$1
    print_info "Building $SERVICE..."
    docker-compose build $SERVICE
    print_success "$SERVICE built successfully"
}

# Start all services
start_all() {
    print_info "Starting all services..."
    docker-compose up -d
    print_success "All services started"
    
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    docker-compose ps
}

# Stop all services
stop_all() {
    print_info "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Run database migrations
migrate() {
    print_info "Running database migrations..."
    docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"
    print_success "Migrations completed"
}

# Generate Prisma client
generate_prisma() {
    print_info "Generating Prisma client..."
    docker-compose exec web sh -c "cd apps/web && npx prisma generate"
    print_success "Prisma client generated"
}

# View logs
logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        docker-compose logs -f --tail=100
    else
        docker-compose logs -f --tail=100 $SERVICE
    fi
}

# Clean everything
clean() {
    print_info "Cleaning up Docker resources..."
    docker-compose down -v
    docker image prune -f
    print_success "Cleanup completed"
}

# Reset everything (nuclear option)
reset() {
    print_error "⚠️  WARNING: This will delete all data and images!"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "Resetting everything..."
        docker-compose down -v
        docker rmi $(docker images -q 'zypher-assessment*' 2>/dev/null) 2>/dev/null || true
        print_success "Reset completed"
    else
        print_info "Reset cancelled"
    fi
}

# Check health
health() {
    print_info "Checking service health..."
    docker-compose ps
    echo ""
    print_info "Testing endpoints..."
    
    echo -n "Web (3000): "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo " ✓" || echo " ✗"
    
    echo -n "Deno (8000): "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health && echo " ✓" || echo " ✗"
    
    echo -n "Qdrant (6333): "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:6333 && echo " ✓" || echo " ✗"
}

# Show usage
usage() {
    echo "Zypher Docker Build Script"
    echo ""
    echo "Usage: ./docker-build.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build         - Build all Docker images"
    echo "  build-web     - Build only web image"
    echo "  build-deno    - Build only deno image"
    echo "  start         - Start all services"
    echo "  stop          - Stop all services"
    echo "  restart       - Restart all services"
    echo "  migrate       - Run database migrations"
    echo "  generate      - Generate Prisma client"
    echo "  logs [service]- View logs (optionally for specific service)"
    echo "  health        - Check service health"
    echo "  clean         - Clean up Docker resources"
    echo "  reset         - Delete everything and start fresh"
    echo "  help          - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-build.sh build"
    echo "  ./docker-build.sh start"
    echo "  ./docker-build.sh logs web"
    echo "  ./docker-build.sh migrate"
}

# Main script logic
main() {
    COMMAND=${1:-help}
    
    case $COMMAND in
        build)
            check_env
            build_all
            ;;
        build-web)
            check_env
            build_service web
            ;;
        build-deno)
            check_env
            build_service deno
            ;;
        start)
            check_env
            start_all
            ;;
        stop)
            stop_all
            ;;
        restart)
            stop_all
            sleep 2
            start_all
            ;;
        migrate)
            migrate
            ;;
        generate)
            generate_prisma
            ;;
        logs)
            logs $2
            ;;
        health)
            health
            ;;
        clean)
            clean
            ;;
        reset)
            reset
            ;;
        help|*)
            usage
            ;;
    esac
}

# Run main function
main "$@"

