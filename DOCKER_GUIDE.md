# 🐳 Docker Deployment Guide

Complete guide for running the Zypher Chatbot Platform using Docker.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Build & Run](#build--run)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🌟 Overview

The Docker setup includes 4 services:

1. **PostgreSQL** - User and chatbot data storage
2. **Qdrant** - Vector database for knowledge embeddings
3. **Deno** - AI agent runtime backend
4. **Next.js Web** - Main web application

All services are orchestrated using Docker Compose with health checks and automatic restarts.

---

## 📋 Prerequisites

- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher
- **4GB RAM** minimum (8GB recommended)
- **10GB** free disk space

### Install Docker

**macOS**:
```bash
brew install --cask docker
```

**Linux**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Windows**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd zypher-assessment
```

### 2. Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env file
nano .env
```

**Minimum required changes**:
```env
# Generate a secure secret
BETTER_AUTH_SECRET="your-secure-random-string-min-32-chars"

# If deploying publicly, change this
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Build and Start

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Wait for services to be healthy (30-60 seconds)
docker-compose ps

# Run database migrations
docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"
```

### 5. Access Application

- **Web App**: http://localhost:3000
- **Deno Backend**: http://localhost:8000
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **PostgreSQL**: localhost:5432

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                   (zypher-network)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │    Qdrant    │  │     Deno     │ │
│  │   (5432)     │  │  (6333/6334) │  │    (8000)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                   │
│                    │   Next.js Web  │                   │
│                    │     (3000)     │                   │
│                    └────────────────┘                   │
│                            │                             │
└────────────────────────────┼─────────────────────────────┘
                             │
                        ┌────▼────┐
                        │  User   │
                        └─────────┘
```

### Service Dependencies

```
web depends on:
  ├── postgres (healthy)
  ├── qdrant (healthy)
  └── deno (healthy)

deno:
  └── (no dependencies)

postgres:
  └── (no dependencies)

qdrant:
  └── (no dependencies)
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://zypher:zypher_password@postgres:5432/zypher"

# Auth (CHANGE THESE!)
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Services
QDRANT_URL="http://qdrant:6333"
DENO_BACKEND_URL="http://deno:8000"

# Node
NODE_ENV="production"
PORT=3000
```

### Generate Secure Secrets

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Custom Ports

Edit `docker-compose.yml` to change exposed ports:

```yaml
services:
  web:
    ports:
      - "8080:3000"  # Change host port to 8080
```

---

## 🔨 Build & Run

### Development Build

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f web
```

### Production Build

```bash
# Build with no cache
docker-compose build --no-cache

# Start with resource limits
docker-compose up -d --scale web=2
```

### Service Management

```bash
# Start all services
docker-compose start

# Stop all services
docker-compose stop

# Restart a service
docker-compose restart web

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

---

## 🗄️ Database Setup

### Run Migrations

**First time setup**:
```bash
docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"
```

**Create new migration** (development):
```bash
docker-compose exec web sh -c "cd apps/web && npx prisma migrate dev --name description"
```

### Access Database

```bash
# Using Prisma Studio
docker-compose exec web sh -c "cd apps/web && npx prisma studio"
# Access at http://localhost:5555

# Using psql
docker-compose exec postgres psql -U zypher -d zypher

# Backup database
docker-compose exec postgres pg_dump -U zypher zypher > backup.sql

# Restore database
docker-compose exec -T postgres psql -U zypher zypher < backup.sql
```

### Reset Database

```bash
# ⚠️ WARNING: This deletes all data
docker-compose down -v
docker-compose up -d
docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"
```

---

## 🐛 Troubleshooting

### Check Service Health

```bash
# View status of all services
docker-compose ps

# Check container logs
docker-compose logs web
docker-compose logs deno
docker-compose logs postgres
docker-compose logs qdrant

# Follow logs in real-time
docker-compose logs -f --tail=100
```

### Common Issues

#### "Connection refused" errors

**Problem**: Services trying to connect before dependencies are ready

**Solution**: Wait for health checks to pass
```bash
# Check health status
docker-compose ps

# Wait for all services to be "healthy"
# Then restart the web service
docker-compose restart web
```

#### "Port already in use"

**Problem**: Port 3000, 5432, 6333, or 8000 already in use

**Solution**: Change ports in `docker-compose.yml`
```yaml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

#### "Out of memory"

**Problem**: Docker doesn't have enough RAM

**Solution**: Increase Docker memory limit
- Docker Desktop → Settings → Resources → Memory → 4GB+

#### "Database migration failed"

**Problem**: Database schema out of sync

**Solution**: Reset and remigrate
```bash
docker-compose down -v
docker-compose up -d
# Wait for services to be healthy
docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"
```

#### Prisma Client not generated

**Problem**: `@prisma/client` not found

**Solution**: Regenerate Prisma client
```bash
docker-compose exec web sh -c "cd apps/web && npx prisma generate"
docker-compose restart web
```

### Rebuild from Scratch

```bash
# Stop everything
docker-compose down -v

# Remove old images
docker-compose rm -f
docker rmi $(docker images -q 'zypher*')

# Rebuild
docker-compose build --no-cache

# Start
docker-compose up -d
```

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Change `BETTER_AUTH_SECRET` to a secure random string
- [ ] Update `BETTER_AUTH_URL` to your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates (use nginx reverse proxy)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure automated backups

### Production Environment Variables

```env
# Production .env
DATABASE_URL="postgresql://user:pass@prod-postgres:5432/zypher"
BETTER_AUTH_SECRET="your-very-secure-production-secret-min-32-chars"
BETTER_AUTH_URL="https://your-domain.com"
QDRANT_URL="http://qdrant:6333"
DENO_BACKEND_URL="http://deno:8000"
NODE_ENV="production"
```

### Deploy with Docker Compose

```bash
# On production server
git clone <repository-url>
cd zypher-assessment

# Copy and configure .env
cp env.example .env
nano .env

# Build and start
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"

# Check everything is running
docker-compose ps
```

### Using Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/zypher
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml zypher

# Check services
docker stack services zypher

# Remove stack
docker stack rm zypher
```

### Kubernetes Deployment

Convert docker-compose to Kubernetes:
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert
kompose convert -f docker-compose.yml

# Deploy
kubectl apply -f .
```

---

## 📊 Monitoring

### View Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats zypher-web
```

### Health Checks

```bash
# Web app
curl http://localhost:3000/

# Deno backend
curl http://localhost:8000/health

# Qdrant
curl http://localhost:6333/

# PostgreSQL (requires psql)
docker-compose exec postgres pg_isready
```

### Logs

```bash
# All logs
docker-compose logs

# Specific service with timestamps
docker-compose logs -t web

# Follow logs (live)
docker-compose logs -f --tail=100

# Save logs to file
docker-compose logs > logs.txt
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d

# Run new migrations
docker-compose exec web sh -c "cd apps/web && npx prisma migrate deploy"
```

### Backup Data

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U zypher zypher | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup Qdrant
docker cp zypher-qdrant:/qdrant/storage ./qdrant_backup_$(date +%Y%m%d)
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything unused
docker system prune -a --volumes
```

---

## 📞 Support

### Useful Commands

```bash
# Enter container shell
docker-compose exec web sh

# Run command in container
docker-compose exec web node --version

# Copy files from container
docker cp zypher-web:/app/logs ./logs

# Copy files to container
docker cp ./config.json zypher-web:/app/config.json

# Inspect container
docker inspect zypher-web

# View container IP
docker inspect zypher-web | grep IPAddress
```

### Getting Help

1. Check container logs: `docker-compose logs`
2. Verify service health: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Review [Main README](./README.md)
5. Check individual app READMEs

---

## 🎯 Next Steps

Once deployed:

1. **Create admin account** at http://localhost:3000/signup
2. **Create your first chatbot** at /dashboard/agents/new
3. **Add knowledge sources** on the chatbot detail page
4. **Test the chatbot** in the Preview tab
5. **Get embed code** from the Embed tab
6. **Deploy on your website**!

---

**Docker Deployment for Zypher Platform** 🐳🚀

