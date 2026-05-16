#!/bin/bash
# ============================================================================
# SUPER CODE - Docker Maintenance Utilities
# ============================================================================
# Useful scripts for managing Docker containers and services
# Usage: bash docker-maintenance.sh <command>
# ============================================================================

# Set working directory to script location
cd "$(dirname "${BASH_SOURCE[0]}")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# FUNCTIONS
# ============================================================================

show_help() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Docker Maintenance Utilities${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Usage: bash docker-maintenance.sh <command>"
    echo ""
    echo "Commands:"
    echo "  status              - Show service status"
    echo "  logs [service]      - View logs (web or db)"
    echo "  restart [service]   - Restart service"
    echo "  backup              - Backup database"
    echo "  restore <file>      - Restore database from backup"
    echo "  clean               - Clean up unused Docker resources"
    echo "  stats               - Show resource usage"
    echo "  shell [service]     - SSH into container"
    echo "  db-shell            - Connect to PostgreSQL"
    echo "  migrations          - Run database migrations"
    echo "  studio              - Open Prisma Studio"
    echo "  health              - Check service health"
    echo "  env-update          - Reload environment variables"
    echo "  export              - Export environment to .env.backup"
    echo "  help                - Show this help message"
    echo ""
}

status() {
    echo -e "${BLUE}Service Status:${NC}"
    docker compose ps
    echo ""
    echo -e "${BLUE}Health Checks:${NC}"
    docker compose ps --format "table {{.Service}}\t{{.Status}}"
}

logs() {
    local service=${1:-web}
    echo -e "${BLUE}Logs for $service (Ctrl+C to exit):${NC}"
    docker compose logs -f "$service"
}

restart_service() {
    local service=${1:-web}
    echo -e "${YELLOW}Restarting $service...${NC}"
    docker compose restart "$service"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $service restarted${NC}"
    else
        echo -e "${RED}✗ Failed to restart $service${NC}"
        return 1
    fi
}

backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local filename="super-code-backup_${timestamp}.sql"
    
    echo -e "${YELLOW}Creating database backup...${NC}"
    docker compose exec db pg_dump -U supercode_user supercode_db > "$filename"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$filename" | cut -f1)
        echo -e "${GREEN}✓ Backup created: $filename (${size})${NC}"
    else
        echo -e "${RED}✗ Backup failed${NC}"
        return 1
    fi
}

restore_database() {
    local file=$1
    
    if [ -z "$file" ]; then
        echo -e "${RED}✗ Please specify backup file${NC}"
        echo "Usage: bash docker-maintenance.sh restore <backup-file.sql>"
        return 1
    fi
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ File not found: $file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Restoring database from $file...${NC}"
    echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
    read -p "Continue? (yes/no): " -r
    
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        docker compose exec -T db psql -U supercode_user supercode_db < "$file"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database restored${NC}"
        else
            echo -e "${RED}✗ Restore failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Restore cancelled${NC}"
    fi
}

clean_docker() {
    echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
    echo ""
    
    echo "1. Removing stopped containers..."
    docker container prune -f
    
    echo "2. Removing unused images..."
    docker image prune -f
    
    echo "3. Removing unused volumes..."
    docker volume prune -f
    
    echo ""
    echo -e "${BLUE}Disk usage after cleanup:${NC}"
    docker system df
    
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

show_stats() {
    echo -e "${BLUE}Docker System Stats:${NC}"
    docker stats --no-stream
    echo ""
    echo -e "${BLUE}Disk Usage:${NC}"
    docker system df
}

shell_into() {
    local service=${1:-web}
    echo -e "${BLUE}Connecting to $service (type 'exit' to quit)...${NC}"
    docker compose exec "$service" sh
}

db_shell() {
    echo -e "${BLUE}Connecting to PostgreSQL database...${NC}"
    echo "Type '\\q' to quit"
    echo ""
    docker compose exec db psql -U supercode_user supercode_db
}

run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker compose exec web pnpm prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrations completed${NC}"
    else
        echo -e "${RED}✗ Migrations failed${NC}"
        return 1
    fi
}

open_studio() {
    echo -e "${YELLOW}Opening Prisma Studio...${NC}"
    echo -e "${BLUE}Note: This will open a local browser window${NC}"
    docker compose exec web pnpm prisma studio
}

check_health() {
    echo -e "${BLUE}Checking Service Health:${NC}"
    echo ""
    
    # Check web service
    echo -n "Web Application: "
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${RED}✗ Not responding${NC}"
    fi
    
    # Check database
    echo -n "PostgreSQL Database: "
    if docker compose exec db pg_isready -U supercode_user > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Ready${NC}"
    else
        echo -e "${RED}✗ Not ready${NC}"
    fi
    
    # Check Docker
    echo -n "Docker Services: "
    if docker compose ps --status running > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${RED}✗ Issues detected${NC}"
    fi
}

env_update() {
    echo -e "${YELLOW}Updating environment variables...${NC}"
    echo "This will restart all services with new .env values"
    read -p "Continue? (yes/no): " -r
    
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        docker compose down
        docker compose up -d
        echo -e "${GREEN}✓ Environment updated and services restarted${NC}"
    else
        echo -e "${YELLOW}Update cancelled${NC}"
    fi
}

export_env() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local filename=".env.backup_${timestamp}"
    
    cp .env "$filename"
    echo -e "${GREEN}✓ Environment exported to: $filename${NC}"
}

# ============================================================================
# MAIN
# ============================================================================

command=$1
case $command in
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    restart)
        restart_service "$2"
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    clean)
        clean_docker
        ;;
    stats)
        show_stats
        ;;
    shell)
        shell_into "$2"
        ;;
    db-shell)
        db_shell
        ;;
    migrations)
        run_migrations
        ;;
    studio)
        open_studio
        ;;
    health)
        check_health
        ;;
    env-update)
        env_update
        ;;
    export)
        export_env
        ;;
    help|"")
        show_help
        ;;
    *)
        echo -e "${RED}✗ Unknown command: $command${NC}"
        show_help
        exit 1
        ;;
esac
